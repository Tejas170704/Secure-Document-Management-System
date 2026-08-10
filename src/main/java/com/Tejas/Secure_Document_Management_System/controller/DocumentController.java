package com.Tejas.Secure_Document_Management_System.controller;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Tejas.Secure_Document_Management_System.dto.request.ShareDocumentRequest;
import com.Tejas.Secure_Document_Management_System.dto.request.UpdateDocumentRequest;
import com.Tejas.Secure_Document_Management_System.dto.response.FileDownloadResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.UploadResponse;
import com.Tejas.Secure_Document_Management_System.entity.Document;
import com.Tejas.Secure_Document_Management_System.service.DocumentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    // Upload Document
    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadDocument(

            @RequestParam("file") MultipartFile file,

            @RequestParam("title") String title,

            @RequestParam("description") String description)

            throws IOException {

        UploadResponse response = documentService.uploadDocument(
                file,
                title,
                description);

        return ResponseEntity.ok(response);
    }

    // Get Logged-in User Documents
   @GetMapping
public ResponseEntity<Page<Document>> getMyDocuments(

        @RequestParam(defaultValue = "0")
        int page,

        @RequestParam(defaultValue = "10")
        int size,

        @RequestParam(defaultValue = "uploadedAt")
        String sortBy) {

    return ResponseEntity.ok(
            documentService.getMyDocuments(
                    page,
                    size,
                    sortBy));
    }
    
    @GetMapping("/search")
public ResponseEntity<Page<Document>> searchDocuments(

        @RequestParam String keyword,

        @RequestParam(defaultValue = "0")
        int page,

        @RequestParam(defaultValue = "10")
        int size,

        @RequestParam(defaultValue = "uploadedAt")
        String sortBy) {

    return ResponseEntity.ok(
            documentService.searchDocuments(
                    keyword,
                    page,
                    size,
                    sortBy));
}

@GetMapping("/shared-with-me")
public ResponseEntity<Page<Document>> getSharedWithMe(

        @RequestParam(defaultValue = "0")
        int page,

        @RequestParam(defaultValue = "10")
        int size,

        @RequestParam(defaultValue = "uploadedAt")
        String sortBy) {

    return ResponseEntity.ok(
            documentService.getSharedWithMe(
                    page,
                    size,
                    sortBy));
}
@GetMapping("/shared/download/{id}")
public ResponseEntity<Resource> downloadSharedDocument(
        @PathVariable Long id) throws Exception {

    FileDownloadResponse response =
            documentService.downloadSharedDocument(id);

    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(
                    response.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" +
                            response.getFileName() + "\"")
            .body(response.getResource());
}

    @GetMapping("/download/{id}")
public ResponseEntity<Resource> downloadDocument(
        @PathVariable Long id) throws Exception {

    FileDownloadResponse response =
            documentService.downloadDocument(id);

    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(
                    response.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" +
                            response.getFileName() + "\"")
            .body(response.getResource());
}

    // Get Single Document
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocument(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                documentService.getDocument(id));
    }



@GetMapping("/shared")
public ResponseEntity<Page<Document>> getSharedDocuments(

        @RequestParam(defaultValue = "0") int page,

        @RequestParam(defaultValue = "10") int size,

        @RequestParam(defaultValue = "uploadedAt") String sortBy) {

    return ResponseEntity.ok(
            documentService.getSharedDocuments(
                    page,
                    size,
                    sortBy));
}

    @PutMapping("/{id}")
public ResponseEntity<Document> updateDocument(
        @PathVariable Long id,
        @Valid @RequestBody UpdateDocumentRequest request) {

    return ResponseEntity.ok(
            documentService.updateDocument(id, request));
}

@PostMapping("/share")
public ResponseEntity<String> shareDocument(
       @Valid @RequestBody ShareDocumentRequest request) {

    documentService.shareDocument(
            request.getDocumentId(),
            request.getEmail());

    return ResponseEntity.ok("Document shared successfully.");
}



    // Delete Document
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDocument(
            @PathVariable Long id) {

        documentService.deleteDocument(id);

        return ResponseEntity.ok("Document deleted successfully.");
    }
}