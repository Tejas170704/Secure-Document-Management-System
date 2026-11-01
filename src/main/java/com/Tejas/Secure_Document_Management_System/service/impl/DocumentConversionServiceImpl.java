package com.Tejas.Secure_Document_Management_System.service.impl;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.io.RandomAccessReadBuffer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Tejas.Secure_Document_Management_System.dto.response.FileDownloadResponse;
import com.Tejas.Secure_Document_Management_System.entity.AuditLog;
import com.Tejas.Secure_Document_Management_System.entity.Document;
import com.Tejas.Secure_Document_Management_System.entity.User;
import com.Tejas.Secure_Document_Management_System.repository.AuditLogRepository;
import com.Tejas.Secure_Document_Management_System.repository.DocumentRepository;
import com.Tejas.Secure_Document_Management_System.repository.UserRepository;
import com.Tejas.Secure_Document_Management_System.security.encryption.AesEncryptionService;
import com.Tejas.Secure_Document_Management_System.service.DocumentConversionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentConversionServiceImpl implements DocumentConversionService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AesEncryptionService aesEncryptionService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public FileDownloadResponse convertUploadedFile(MultipartFile file, String targetFormat) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = null;
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            user = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String baseName = getBaseName(originalFilename);
        String sourceExt = getExtension(originalFilename).toLowerCase();
        String targetExt = targetFormat.toLowerCase().trim().replace(".", "");

        byte[] inputBytes = file.getBytes();
        byte[] convertedBytes = performConversion(inputBytes, sourceExt, targetExt, originalFilename, baseName);

        String outputFilename = baseName + "_converted." + getOutputExtension(targetExt);
        String contentType = getContentTypeForFormat(targetExt);

        if (user != null) {
            saveAuditLog(user, "CONVERT", originalFilename + " -> " + targetExt.toUpperCase());
        }

        return new FileDownloadResponse(
                new ByteArrayResource(convertedBytes),
                outputFilename,
                contentType);
    }

    @Override
    public FileDownloadResponse convertStoredDocument(Long documentId, String targetFormat, boolean saveToVault) throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Read & Decrypt
        Path filePath = Paths.get(document.getFilePath());
        byte[] encryptedBytes = Files.readAllBytes(filePath);
        byte[] decryptedBytes = aesEncryptionService.decrypt(encryptedBytes);

        String originalFilename = document.getOriginalFileName();
        String baseName = getBaseName(originalFilename);
        String sourceExt = getExtension(originalFilename).toLowerCase();
        String targetExt = targetFormat.toLowerCase().trim().replace(".", "");

        byte[] convertedBytes = performConversion(decryptedBytes, sourceExt, targetExt, originalFilename, baseName);
        String outputFilename = baseName + "_converted." + getOutputExtension(targetExt);
        String contentType = getContentTypeForFormat(targetExt);

        // Optionally save converted document to user's encrypted vault
        if (saveToVault) {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String storedFileName = UUID.randomUUID() + "_" + outputFilename + ".enc";
            Path newFilePath = uploadPath.resolve(storedFileName);

            byte[] newEncryptedBytes = aesEncryptionService.encrypt(convertedBytes);
            Files.write(newFilePath, newEncryptedBytes);

            Document newDocument = Document.builder()
                    .title(document.getTitle() + " (" + targetExt.toUpperCase() + ")")
                    .description("Converted from " + originalFilename + " to " + targetExt.toUpperCase())
                    .originalFileName(outputFilename)
                    .storedFileName(storedFileName)
                    .fileType(contentType)
                    .fileSize((long) convertedBytes.length)
                    .filePath(newFilePath.toString())
                    .encrypted(true)
                    .uploadedAt(LocalDateTime.now())
                    .owner(user)
                    .build();

            documentRepository.save(newDocument);
            saveAuditLog(user, "CONVERT_SAVE", originalFilename + " -> " + outputFilename);
        } else {
            saveAuditLog(user, "CONVERT", originalFilename + " -> " + targetExt.toUpperCase());
        }

        return new FileDownloadResponse(
                new ByteArrayResource(convertedBytes),
                outputFilename,
                contentType);
    }

    private byte[] performConversion(byte[] inputBytes, String sourceExt, String targetExt, String originalFilename, String baseName) throws Exception {
        if (sourceExt.equals("pdf")) {
            if (targetExt.equals("docx") || targetExt.equals("doc") || targetExt.equals("word")) {
                return pdfToDocx(inputBytes);
            } else if (targetExt.equals("html") || targetExt.equals("css")) {
                return pdfToHtml(inputBytes);
            } else if (targetExt.equals("txt") || targetExt.equals("text")) {
                return pdfToText(inputBytes);
            }
        } else if (sourceExt.equals("docx") || sourceExt.equals("doc")) {
            if (targetExt.equals("pdf")) {
                return docxToPdf(inputBytes);
            } else if (targetExt.equals("html") || targetExt.equals("css")) {
                return docxToHtml(inputBytes);
            } else if (targetExt.equals("txt") || targetExt.equals("text")) {
                return docxToText(inputBytes);
            }
        } else if (sourceExt.equals("txt") || sourceExt.equals("md") || sourceExt.equals("csv")) {
            if (targetExt.equals("pdf")) {
                String text = new String(inputBytes, StandardCharsets.UTF_8);
                return textToPdf(text, baseName);
            } else if (targetExt.equals("docx")) {
                return textToDocx(new String(inputBytes, StandardCharsets.UTF_8), baseName);
            } else if (targetExt.equals("html") || targetExt.equals("css")) {
                return textToHtml(new String(inputBytes, StandardCharsets.UTF_8), baseName);
            }
        } else if (sourceExt.equals("png") || sourceExt.equals("jpg") || sourceExt.equals("jpeg") || sourceExt.equals("webp")) {
            if (targetExt.equals("pdf")) {
                return imageToPdf(inputBytes, originalFilename, "image/" + sourceExt);
            }
        }

        // Generic fallback: text/doc to PDF or text extraction
        String rawText = new String(inputBytes, StandardCharsets.UTF_8);
        if (targetExt.equals("pdf")) {
            return textToPdf(rawText, baseName);
        } else if (targetExt.equals("docx")) {
            return textToDocx(rawText, baseName);
        } else if (targetExt.equals("html") || targetExt.equals("css")) {
            return textToHtml(rawText, baseName);
        }

        throw new IllegalArgumentException("Unsupported conversion from " + sourceExt + " to " + targetExt);
    }

    @Override
    public byte[] pdfToDocx(byte[] pdfBytes) throws Exception {
        try (PDDocument pdfDocument = Loader.loadPDF(new RandomAccessReadBuffer(pdfBytes));
             XWPFDocument docxDocument = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(pdfDocument);

            String[] lines = text.split("\\r?\\n");
            for (String line : lines) {
                XWPFParagraph paragraph = docxDocument.createParagraph();
                if (line.trim().isEmpty()) {
                    continue;
                }
                XWPFRun run = paragraph.createRun();
                run.setText(line);
                run.setFontFamily("Calibri");
                run.setFontSize(11);
            }

            docxDocument.write(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] docxToPdf(byte[] docxBytes) throws Exception {
        try (XWPFDocument docx = new XWPFDocument(new ByteArrayInputStream(docxBytes));
             PDDocument pdf = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            PDPage page = new PDPage(PDRectangle.A4);
            pdf.addPage(page);

            float margin = 50;
            float yStart = page.getMediaBox().getHeight() - margin;
            float yPosition = yStart;
            float pageWidth = page.getMediaBox().getWidth() - 2 * margin;
            float fontSize = 11;
            float leading = 15;

            PDPageContentStream contentStream = new PDPageContentStream(pdf, page);
            contentStream.setFont(font, fontSize);

            List<XWPFParagraph> paragraphs = docx.getParagraphs();
            for (XWPFParagraph p : paragraphs) {
                String text = p.getText();
                if (text == null || text.trim().isEmpty()) {
                    yPosition -= leading;
                    continue;
                }

                // Check for heading styles
                boolean isHeading = p.getStyle() != null && p.getStyle().toLowerCase().contains("heading");
                PDFont currentFont = isHeading ? boldFont : font;
                float currentFontSize = isHeading ? 14 : fontSize;

                List<String> wrappedLines = wrapText(text, currentFont, currentFontSize, pageWidth);
                for (String line : wrappedLines) {
                    if (yPosition < margin + 40) {
                        contentStream.close();
                        page = new PDPage(PDRectangle.A4);
                        pdf.addPage(page);
                        contentStream = new PDPageContentStream(pdf, page);
                        contentStream.setFont(currentFont, currentFontSize);
                        yPosition = yStart;
                    }

                    contentStream.beginText();
                    contentStream.setFont(currentFont, currentFontSize);
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText(cleanTextForPdf(line));
                    contentStream.endText();
                    yPosition -= leading;
                }
            }

            contentStream.close();
            pdf.save(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] docxToHtml(byte[] docxBytes) throws Exception {
        try (XWPFDocument docx = new XWPFDocument(new ByteArrayInputStream(docxBytes))) {
            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n");
            html.append("<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
            html.append("<title>Document Preview</title>\n");
            html.append("<style>\n");
            html.append("body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 40px 20px; }\n");
            html.append(".document-container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 48px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }\n");
            html.append("h1, h2, h3 { color: #0f172a; margin-top: 24px; margin-bottom: 12px; }\n");
            html.append("p { margin-bottom: 16px; }\n");
            html.append(".badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }\n");
            html.append("</style>\n</head>\n<body>\n<div class=\"document-container\">\n");
            html.append("<div class=\"badge\">Converted Document (DOCX to HTML/CSS)</div>\n");

            for (XWPFParagraph p : docx.getParagraphs()) {
                String text = p.getText();
                if (text == null || text.trim().isEmpty()) {
                    continue;
                }
                String escaped = escapeHtml(text);
                if (p.getStyle() != null && p.getStyle().toLowerCase().contains("heading 1")) {
                    html.append("<h1>").append(escaped).append("</h1>\n");
                } else if (p.getStyle() != null && p.getStyle().toLowerCase().contains("heading")) {
                    html.append("<h2>").append(escaped).append("</h2>\n");
                } else {
                    html.append("<p>").append(escaped).append("</p>\n");
                }
            }

            html.append("</div>\n</body>\n</html>");
            return html.toString().getBytes(StandardCharsets.UTF_8);
        }
    }

    @Override
    public byte[] pdfToHtml(byte[] pdfBytes) throws Exception {
        try (PDDocument pdf = Loader.loadPDF(new RandomAccessReadBuffer(pdfBytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(pdf);

            StringBuilder html = new StringBuilder();
            html.append("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n");
            html.append("<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
            html.append("<title>PDF Converted Document</title>\n");
            html.append("<style>\n");
            html.append("body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 40px 20px; }\n");
            html.append(".document-container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 48px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }\n");
            html.append("h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }\n");
            html.append("p { margin-bottom: 14px; }\n");
            html.append(".badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }\n");
            html.append("</style>\n</head>\n<body>\n<div class=\"document-container\">\n");
            html.append("<div class=\"badge\">Converted from PDF to HTML/CSS</div>\n");

            String[] lines = text.split("\\r?\\n");
            for (String line : lines) {
                if (line.trim().isEmpty()) continue;
                html.append("<p>").append(escapeHtml(line)).append("</p>\n");
            }

            html.append("</div>\n</body>\n</html>");
            return html.toString().getBytes(StandardCharsets.UTF_8);
        }
    }

    @Override
    public byte[] textToPdf(String text, String title) throws Exception {
        try (PDDocument pdf = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDFont font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            PDPage page = new PDPage(PDRectangle.A4);
            pdf.addPage(page);

            float margin = 50;
            float yStart = page.getMediaBox().getHeight() - margin;
            float yPosition = yStart;
            float pageWidth = page.getMediaBox().getWidth() - 2 * margin;
            float fontSize = 10.5f;
            float leading = 15;

            PDPageContentStream contentStream = new PDPageContentStream(pdf, page);

            // Title
            if (title != null && !title.isEmpty()) {
                contentStream.beginText();
                contentStream.setFont(boldFont, 16);
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText(cleanTextForPdf(title));
                contentStream.endText();
                yPosition -= 30;
            }

            String[] lines = text.split("\\r?\\n");
            for (String line : lines) {
                if (line.trim().isEmpty()) {
                    yPosition -= leading;
                    continue;
                }

                List<String> wrappedLines = wrapText(line, font, fontSize, pageWidth);
                for (String wrappedLine : wrappedLines) {
                    if (yPosition < margin + 40) {
                        contentStream.close();
                        page = new PDPage(PDRectangle.A4);
                        pdf.addPage(page);
                        contentStream = new PDPageContentStream(pdf, page);
                        contentStream.setFont(font, fontSize);
                        yPosition = yStart;
                    }

                    contentStream.beginText();
                    contentStream.setFont(font, fontSize);
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText(cleanTextForPdf(wrappedLine));
                    contentStream.endText();
                    yPosition -= leading;
                }
            }

            contentStream.close();
            pdf.save(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] imageToPdf(byte[] imageBytes, String fileName, String contentType) throws Exception {
        try (PDDocument pdf = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A4);
            pdf.addPage(page);

            PDImageXObject image = PDImageXObject.createFromByteArray(pdf, imageBytes, fileName);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();
            float margin = 40;

            float maxImgWidth = pageWidth - 2 * margin;
            float maxImgHeight = pageHeight - 2 * margin;

            float imgWidth = image.getWidth();
            float imgHeight = image.getHeight();

            float scale = Math.min(maxImgWidth / imgWidth, maxImgHeight / imgHeight);
            if (scale > 1.0f) {
                scale = 1.0f; // Do not upscale beyond original
            }

            float finalWidth = imgWidth * scale;
            float finalHeight = imgHeight * scale;

            float x = (pageWidth - finalWidth) / 2;
            float y = (pageHeight - finalHeight) / 2;

            try (PDPageContentStream contentStream = new PDPageContentStream(pdf, page)) {
                contentStream.drawImage(image, x, y, finalWidth, finalHeight);
            }

            pdf.save(out);
            return out.toByteArray();
        }
    }

    @Override
    public byte[] pdfToText(byte[] pdfBytes) throws Exception {
        try (PDDocument pdf = Loader.loadPDF(new RandomAccessReadBuffer(pdfBytes))) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(pdf);
            return text.getBytes(StandardCharsets.UTF_8);
        }
    }

    @Override
    public byte[] docxToText(byte[] docxBytes) throws Exception {
        try (XWPFDocument docx = new XWPFDocument(new ByteArrayInputStream(docxBytes));
             XWPFWordExtractor extractor = new XWPFWordExtractor(docx)) {
            return extractor.getText().getBytes(StandardCharsets.UTF_8);
        }
    }

    private byte[] textToDocx(String text, String title) throws Exception {
        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            if (title != null && !title.isEmpty()) {
                XWPFParagraph titlePara = doc.createParagraph();
                titlePara.setAlignment(ParagraphAlignment.LEFT);
                XWPFRun titleRun = titlePara.createRun();
                titleRun.setText(title);
                titleRun.setBold(true);
                titleRun.setFontSize(16);
                titleRun.setFontFamily("Calibri");
            }

            String[] lines = text.split("\\r?\\n");
            for (String line : lines) {
                XWPFParagraph para = doc.createParagraph();
                if (line.trim().isEmpty()) continue;
                XWPFRun run = para.createRun();
                run.setText(line);
                run.setFontSize(11);
                run.setFontFamily("Calibri");
            }

            doc.write(out);
            return out.toByteArray();
        }
    }

    private byte[] textToHtml(String text, String title) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n");
        html.append("<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("<title>").append(escapeHtml(title)).append("</title>\n");
        html.append("<style>\n");
        html.append("body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; padding: 40px 20px; }\n");
        html.append(".document-container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 48px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }\n");
        html.append("h1 { color: #0f172a; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }\n");
        html.append("p { margin-bottom: 14px; white-space: pre-wrap; }\n");
        html.append("</style>\n</head>\n<body>\n<div class=\"document-container\">\n");
        html.append("<h1>").append(escapeHtml(title)).append("</h1>\n");

        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            if (line.trim().isEmpty()) continue;
            html.append("<p>").append(escapeHtml(line)).append("</p>\n");
        }

        html.append("</div>\n</body>\n</html>");
        return html.toString().getBytes(StandardCharsets.UTF_8);
    }

    private List<String> wrapText(String text, PDFont font, float fontSize, float maxWidth) throws IOException {
        List<String> result = new ArrayList<>();
        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            String candidate = currentLine.length() == 0 ? word : currentLine + " " + word;
            float width = font.getStringWidth(cleanTextForPdf(candidate)) / 1000 * fontSize;

            if (width <= maxWidth) {
                currentLine = new StringBuilder(candidate);
            } else {
                if (currentLine.length() > 0) {
                    result.add(currentLine.toString());
                }
                currentLine = new StringBuilder(word);
            }
        }

        if (currentLine.length() > 0) {
            result.add(currentLine.toString());
        }

        return result;
    }

    private String cleanTextForPdf(String input) {
        if (input == null) return "";
        // Replace non-ASCII and special characters unsupported by standard PDF fonts
        return input.replaceAll("[^\\x20-\\x7E]", " ");
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String getBaseName(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(0, dot) : filename;
    }

    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : "";
    }

    private String getOutputExtension(String targetExt) {
        if (targetExt.equals("word") || targetExt.equals("doc")) return "docx";
        if (targetExt.equals("text")) return "txt";
        if (targetExt.equals("css")) return "html";
        return targetExt;
    }

    private String getContentTypeForFormat(String format) {
        switch (format.toLowerCase()) {
            case "pdf":
                return "application/pdf";
            case "docx":
            case "doc":
            case "word":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "html":
            case "css":
                return "text/html";
            case "txt":
            case "text":
                return "text/plain";
            default:
                return "application/octet-stream";
        }
    }

    private void saveAuditLog(User user, String action, String documentName) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .documentName(documentName)
                .actionTime(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }
}
