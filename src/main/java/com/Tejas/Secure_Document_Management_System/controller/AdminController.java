package com.Tejas.Secure_Document_Management_System.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Tejas.Secure_Document_Management_System.dto.response.AdminDashboardResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.UserResponse;
import com.Tejas.Secure_Document_Management_System.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ================= Dashboard =================

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {

        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ================= Get All Users =================

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "5") int size,

            @RequestParam(defaultValue = "fullName") String sortBy) {

        return ResponseEntity.ok(
                adminService.getAllUsers(page, size, sortBy));
    }

    // ================= Get User By Id =================

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminService.getUserById(id));
    }

    // ================= Delete User =================

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {
             System.out.println("DELETE API HIT");
        adminService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully.");
    }

}