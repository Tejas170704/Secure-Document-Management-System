package com.Tejas.Secure_Document_Management_System.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.Tejas.Secure_Document_Management_System.dto.response.AdminDashboardResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.UserResponse;
import com.Tejas.Secure_Document_Management_System.entity.User;
import com.Tejas.Secure_Document_Management_System.repository.AuditLogRepository;
import com.Tejas.Secure_Document_Management_System.repository.DocumentRepository;
import com.Tejas.Secure_Document_Management_System.repository.DocumentShareRepository;
import com.Tejas.Secure_Document_Management_System.repository.UserRepository;
import com.Tejas.Secure_Document_Management_System.service.AdminService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final DocumentShareRepository documentShareRepository;
    private final AuditLogRepository auditLogRepository;

    // ================= Dashboard =================

    @Override
    public AdminDashboardResponse getDashboard() {

        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalDocuments(documentRepository.count())
                .totalSharedDocuments(documentShareRepository.count())
                .totalAuditLogs(auditLogRepository.count())
                .build();
    }

    // ================= Get All Users =================

    @Override
    public Page<UserResponse> getAllUsers(
            int page,
            int size,
            String sortBy) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortBy).ascending());

        Page<User> users = userRepository.findAll(pageable);

        return users.map(user -> UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build());
    }

    // ================= Get User By ID =================

    @Override
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // ================= Delete User =================

    @Override
    public void deleteUser(Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User loggedInAdmin = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        // Prevent admin from deleting their own account
        if (loggedInAdmin.getId().equals(id)) {
            throw new RuntimeException(
                    "You cannot delete your own account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        userRepository.delete(user);
    }
}