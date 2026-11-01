package com.Tejas.Secure_Document_Management_System.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Tejas.Secure_Document_Management_System.dto.response.FileDownloadResponse;
import com.Tejas.Secure_Document_Management_System.service.DocumentConversionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class ConversionController {

    private final DocumentConversionService conversionService;

    /**
     * Convert an uploaded file on-the-fly to a target format.
     */
    @PostMapping("/convert")
    public ResponseEntity<Resource> convertFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetFormat") String targetFormat) throws Exception {

        FileDownloadResponse response = conversionService.convertUploadedFile(file, targetFormat);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(response.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + response.getFileName() + "\"")
                .body(response.getResource());
    }

    /**
     * Convert a stored encrypted document by ID to a target format.
     */
    @PostMapping("/{id}/convert")
    public ResponseEntity<Resource> convertStoredDocument(
            @PathVariable Long id,
            @RequestParam(defaultValue = "pdf") String targetFormat,
            @RequestParam(defaultValue = "false") boolean saveToVault) throws Exception {

        FileDownloadResponse response = conversionService.convertStoredDocument(id, targetFormat, saveToVault);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(response.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + response.getFileName() + "\"")
                .body(response.getResource());
    }
}
