package com.Tejas.Secure_Document_Management_System.service;

import org.springframework.web.multipart.MultipartFile;

import com.Tejas.Secure_Document_Management_System.dto.response.FileDownloadResponse;

public interface DocumentConversionService {

    /**
     * Converts an uploaded file on-the-fly to the specified target format.
     */
    FileDownloadResponse convertUploadedFile(MultipartFile file, String targetFormat) throws Exception;

    /**
     * Converts a stored encrypted document by ID to the target format.
     * Optionally saves the converted document back into the user's encrypted vault.
     */
    FileDownloadResponse convertStoredDocument(Long documentId, String targetFormat, boolean saveToVault) throws Exception;

    /**
     * Converts PDF bytes to Microsoft Word (.docx) bytes.
     */
    byte[] pdfToDocx(byte[] pdfBytes) throws Exception;

    /**
     * Converts Microsoft Word (.docx) bytes to PDF bytes.
     */
    byte[] docxToPdf(byte[] docxBytes) throws Exception;

    /**
     * Converts Microsoft Word (.docx) bytes to HTML/CSS bytes.
     */
    byte[] docxToHtml(byte[] docxBytes) throws Exception;

    /**
     * Converts PDF bytes to HTML/CSS bytes.
     */
    byte[] pdfToHtml(byte[] pdfBytes) throws Exception;

    /**
     * Converts plain text to formatted PDF bytes.
     */
    byte[] textToPdf(String text, String title) throws Exception;

    /**
     * Converts image bytes (PNG, JPG, WEBP) to PDF bytes.
     */
    byte[] imageToPdf(byte[] imageBytes, String fileName, String contentType) throws Exception;

    /**
     * Extracts text from PDF bytes.
     */
    byte[] pdfToText(byte[] pdfBytes) throws Exception;

    /**
     * Extracts text from Microsoft Word (.docx) bytes.
     */
    byte[] docxToText(byte[] docxBytes) throws Exception;
}
