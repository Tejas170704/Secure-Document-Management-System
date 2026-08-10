package com.Tejas.Secure_Document_Management_System.service;

import org.springframework.data.domain.Page;

import com.Tejas.Secure_Document_Management_System.dto.response.AdminDashboardResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.UserResponse;
public interface AdminService {

    AdminDashboardResponse getDashboard();
    
Page<UserResponse> getAllUsers(
        int page,
        int size,
        String sortBy);

UserResponse getUserById(Long id);

void deleteUser(Long id);
}