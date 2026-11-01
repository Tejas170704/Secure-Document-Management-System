package com.Tejas.Secure_Document_Management_System.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Tejas.Secure_Document_Management_System.entity.Document;
import com.Tejas.Secure_Document_Management_System.entity.DocumentShare;
import com.Tejas.Secure_Document_Management_System.entity.User;

@Repository
public interface DocumentShareRepository
        extends JpaRepository<DocumentShare, Long> {

    // Shared With Me
    Page<DocumentShare> findBySharedWithUser(
            User user,
            Pageable pageable);

    // Check duplicate share
    Optional<DocumentShare> findByDocumentAndSharedWithUser(
            Document document,
            User user);

    // All shares of one document
    List<DocumentShare> findByDocument(
            Document document);
}