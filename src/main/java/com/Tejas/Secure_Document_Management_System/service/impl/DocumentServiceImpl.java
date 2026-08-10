package com.Tejas.Secure_Document_Management_System.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Tejas.Secure_Document_Management_System.dto.request.UpdateDocumentRequest;
import com.Tejas.Secure_Document_Management_System.dto.response.FileDownloadResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.UploadResponse;
import com.Tejas.Secure_Document_Management_System.entity.AuditLog;
import com.Tejas.Secure_Document_Management_System.entity.Document;
import com.Tejas.Secure_Document_Management_System.entity.DocumentShare;
import com.Tejas.Secure_Document_Management_System.entity.User;
import com.Tejas.Secure_Document_Management_System.repository.AuditLogRepository;
import com.Tejas.Secure_Document_Management_System.repository.DocumentRepository;
import com.Tejas.Secure_Document_Management_System.repository.DocumentShareRepository;
import com.Tejas.Secure_Document_Management_System.repository.UserRepository;
import com.Tejas.Secure_Document_Management_System.security.encryption.AesEncryptionService;
import com.Tejas.Secure_Document_Management_System.service.DocumentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {
        
   private final DocumentRepository documentRepository;
private final UserRepository userRepository;
private final DocumentShareRepository documentShareRepository;
private final AuditLogRepository auditLogRepository;
private final AesEncryptionService aesEncryptionService;
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public UploadResponse uploadDocument(
            MultipartFile file,
            String title,
            String description) throws IOException {

        // Logged-in user
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create upload folder if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String storedFileName =
                UUID.randomUUID() + "_" + file.getOriginalFilename() + ".enc";

        // Save file to disk
        Path filePath = uploadPath.resolve(storedFileName);

       // Files.copy(
         //       file.getInputStream(),
         //       filePath,
        //     StandardCopyOption.REPLACE_EXISTING);

        try {
            // Read original file bytes
            byte[] originalBytes = file.getBytes();

            // Encrypt
            byte[] encryptedBytes = aesEncryptionService.encrypt(originalBytes);

            // Save encrypted file
            Files.write(filePath, encryptedBytes);
        } catch (Exception e) {
            throw new IOException("Failed to encrypt file", e);
        }

        // Save metadata
        Document document = Document.builder()
                .title(title)
                .description(description)
                .originalFileName(file.getOriginalFilename())
                .storedFileName(storedFileName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(filePath.toString())
                .encrypted(true)
                .uploadedAt(LocalDateTime.now())
                .owner(user)
                .build();

        documentRepository.save(document);
        saveAuditLog(
        user,
        "UPLOAD",
        document.getOriginalFileName());

        return new UploadResponse(
                true,
                "Document uploaded successfully.");
    }
    
  @Override
public FileDownloadResponse downloadDocument(Long id) throws Exception {

    // Find document
    Document document = documentRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Document not found"));

    // Get logged-in user
    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    // Read encrypted file
    Path filePath = Paths.get(document.getFilePath());

    byte[] encryptedBytes = Files.readAllBytes(filePath);

    // Decrypt
    byte[] decryptedBytes =
            aesEncryptionService.decrypt(encryptedBytes);

    // Create audit log
    saveAuditLog(
            user,
            "DOWNLOAD",
            document.getOriginalFileName());

    // Return file
    ByteArrayResource resource =
            new ByteArrayResource(decryptedBytes);

    return new FileDownloadResponse(
            resource,
            document.getOriginalFileName(),
            document.getFileType());
}

@Override
public FileDownloadResponse downloadSharedDocument(Long id)
        throws Exception {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Document document = documentRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Document not found"));

    documentShareRepository
            .findByDocumentAndSharedWithUser(document, user)
            .orElseThrow(() ->
                    new RuntimeException(
                            "You don't have access to this document"));

    Path filePath = Paths.get(document.getFilePath());

    byte[] encryptedBytes = Files.readAllBytes(filePath);

    byte[] decryptedBytes =
            aesEncryptionService.decrypt(encryptedBytes);

    ByteArrayResource resource =
            new ByteArrayResource(decryptedBytes);

    return new FileDownloadResponse(
            resource,
            document.getOriginalFileName(),
            document.getFileType());
}

   @Override
public Page<Document> getMyDocuments(
        int page,
        int size,
        String sortBy) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    User user = userRepository
            .findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Pageable pageable = PageRequest.of(
            page,
            size,
            Sort.by(sortBy).descending());

    return documentRepository.findByOwner(
            user,
            pageable);
}
    @Override
    public Document getDocument(Long id) {

        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

   @Override
public void deleteDocument(Long id) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Document document = documentRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Document not found"));

    // Only owner can delete
    if (!document.getOwner().getId().equals(user.getId())) {
        throw new RuntimeException(
                "You are not authorized to delete this document.");
    }

    // Save audit log BEFORE deleting
    saveAuditLog(
            user,
            "DELETE",
            document.getOriginalFileName());

    try {
        Files.deleteIfExists(Paths.get(document.getFilePath()));
    } catch (IOException e) {
        throw new RuntimeException("Unable to delete file");
    }

    documentRepository.delete(document);
}
  @Override
public Document updateDocument(Long id,
                               UpdateDocumentRequest request) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    User user = userRepository
            .findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Document document =
            documentRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException("Document not found"));

    // Only owner can update
    if (!document.getOwner().getId().equals(user.getId())) {
        throw new RuntimeException(
                "You are not authorized to update this document.");
    }

    document.setTitle(request.getTitle());
    document.setDescription(request.getDescription());

    Document updatedDocument = documentRepository.save(document);

    // Save audit log
    saveAuditLog(
            user,
            "UPDATE",
            updatedDocument.getOriginalFileName());

    return updatedDocument;
}

    @Override
public Page<Document> searchDocuments(
        String keyword,
        int page,
        int size,
        String sortBy) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    User user = userRepository
            .findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Pageable pageable = PageRequest.of(
            page,
            size,
            Sort.by(sortBy).descending());

    return documentRepository
            .findByOwnerAndTitleContainingIgnoreCaseOrOwnerAndDescriptionContainingIgnoreCaseOrOwnerAndOriginalFileNameContainingIgnoreCase(
                    user,
                    keyword,
                    user,
                    keyword,
                    user,
                    keyword,
                    pageable);
}

@Override
public Page<Document> getSharedWithMe(
        int page,
        int size,
        String sortBy) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    User user = userRepository
            .findByEmail(authentication.getName())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Pageable pageable = PageRequest.of(
            page,
            size,
            Sort.by(sortBy).descending());

    Page<DocumentShare> shares =
            documentShareRepository.findBySharedWithUser(
                    user,
                    pageable);

    return shares.map(DocumentShare::getDocument);
}

@Override
public Page<Document> getSharedDocuments(
        int page,
        int size,
        String sortBy) {

    return getSharedWithMe(
            page,
            size,
            sortBy);
}

@Override
public void shareDocument(Long documentId, String email) {

    // Logged-in user
    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String ownerEmail = authentication.getName();

    User owner = userRepository.findByEmail(ownerEmail)
            .orElseThrow(() ->
                    new RuntimeException("Owner not found"));

    // Find document
    Document document = documentRepository.findById(documentId)
            .orElseThrow(() ->
                    new RuntimeException("Document not found"));

    // Only owner can share
    if (!document.getOwner().getId().equals(owner.getId())) {
        throw new RuntimeException("You are not the owner of this document.");
    }

    // Find recipient
    User sharedUser = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    // Prevent duplicate sharing
    if (documentShareRepository
            .findByDocumentAndSharedWithUser(document, sharedUser)
            .isPresent()) {

        throw new RuntimeException(
                "Document already shared with this user.");
    }

    

    // Save share record
    DocumentShare documentShare = DocumentShare.builder()
            .document(document)
            .sharedWithUser(sharedUser)
            .sharedAt(LocalDateTime.now())
            .build();

        documentShareRepository.save(documentShare);

         // Save audit log AFTER successful sharing
    saveAuditLog(
            owner,
            "SHARE",
            document.getOriginalFileName());

}

private void saveAuditLog(User user,
                          String action,
                          String documentName) {

    AuditLog log = AuditLog.builder()
            .user(user)
            .action(action)
            .documentName(documentName)
            .actionTime(LocalDateTime.now())
            .build();

    auditLogRepository.save(log);
}
}