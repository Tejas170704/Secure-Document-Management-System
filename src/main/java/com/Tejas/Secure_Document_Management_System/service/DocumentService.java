package com.Tejas.Secure_Document_Management_System.service;

import java.io.IOException;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.Tejas.Secure_Document_Management_System.dto.request.UpdateDocumentRequest;
import com.Tejas.Secure_Document_Management_System.dto.response.FileDownloadResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.UploadResponse;
import com.Tejas.Secure_Document_Management_System.entity.Document;

public interface DocumentService {

    // Upload Document
    UploadResponse uploadDocument(
            MultipartFile file,
            String title,
            String description)
            throws IOException;

    // Download Own Document
    FileDownloadResponse downloadDocument(Long id)
            throws Exception;

    // Download Shared Document
    FileDownloadResponse downloadSharedDocument(Long id)
            throws Exception;

    // My Documents (Pagination)
    Page<Document> getMyDocuments(
            int page,
            int size,
            String sortBy);

    // Get Single Document
    Document getDocument(Long id);

    // Delete Document
    void deleteDocument(Long id);

    // Update Document
    Document updateDocument(
            Long id,
            UpdateDocumentRequest request);

    // Search Documents (Pagination)
    Page<Document> searchDocuments(
            String keyword,
            int page,
            int size,
            String sortBy);

    // Share Document
    void shareDocument(
            Long documentId,
            String email);

    // Shared With Me (Pagination)
    Page<Document> getSharedWithMe(
            int page,
            int size,
            String sortBy);

    // Shared Documents
    Page<Document> getSharedDocuments(
            int page,
            int size,
            String sortBy);
}