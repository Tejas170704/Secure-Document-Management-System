package com.Tejas.Secure_Document_Management_System.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Tejas.Secure_Document_Management_System.dto.request.LoginRequest;
import com.Tejas.Secure_Document_Management_System.dto.request.RegisterRequest;
import com.Tejas.Secure_Document_Management_System.dto.response.ApiResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.LoginResponse;
import com.Tejas.Secure_Document_Management_System.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse register(@Valid @RequestBody RegisterRequest request) {

        return authService.register(request);

    }
   @PostMapping("/login")
public ResponseEntity<LoginResponse> login(
        @Valid @RequestBody LoginRequest request) {

    System.out.println("========== LOGIN API CALLED ==========");
    System.out.println("Email: " + request.getEmail());

    return ResponseEntity.ok(authService.login(request));
}
}