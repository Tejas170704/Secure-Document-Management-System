package com.tejas.Secure_Document_Management_System.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tejas.Secure_Document_Management_System.dto.request.RegisterRequest;
import com.tejas.Secure_Document_Management_System.dto.response.ApiResponse;
import com.tejas.Secure_Document_Management_System.service.AuthService;

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
}