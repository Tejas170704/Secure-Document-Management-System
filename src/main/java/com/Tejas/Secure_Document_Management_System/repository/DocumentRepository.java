package com.Tejas.Secure_Document_Management_System.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Tejas.Secure_Document_Management_System.entity.Document;
import com.Tejas.Secure_Document_Management_System.entity.User;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    // My Documents with Pagination
    Page<Document> findByOwner(
            User owner,
            Pageable pageable);

    // Search Documents with Pagination
    Page<Document>
    findByOwnerAndTitleContainingIgnoreCaseOrOwnerAndDescriptionContainingIgnoreCaseOrOwnerAndOriginalFileNameContainingIgnoreCase(
            User owner1,
            String title,

            User owner2,
            String description,

            User owner3,
            String fileName,

            Pageable pageable);
}