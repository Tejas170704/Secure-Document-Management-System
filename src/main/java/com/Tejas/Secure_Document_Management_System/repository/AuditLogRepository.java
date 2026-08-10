package com.Tejas.Secure_Document_Management_System.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Tejas.Secure_Document_Management_System.entity.AuditLog;
import com.Tejas.Secure_Document_Management_System.entity.User;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUser(User user);

    long countByAction(String action);

List<AuditLog> findTop20ByOrderByActionTimeDesc();
}