package com.Tejas.Secure_Document_Management_System.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.Tejas.Secure_Document_Management_System.dto.request.LoginRequest;
import com.Tejas.Secure_Document_Management_System.dto.request.RegisterRequest;
import com.Tejas.Secure_Document_Management_System.dto.response.ApiResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.LoginResponse;
import com.Tejas.Secure_Document_Management_System.entity.User;
import com.Tejas.Secure_Document_Management_System.enums.Role;
import com.Tejas.Secure_Document_Management_System.repository.UserRepository;
import com.Tejas.Secure_Document_Management_System.security.jwt.JwtService;
import com.Tejas.Secure_Document_Management_System.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    // ================= LOGIN =================

    @Override
    public LoginResponse login(LoginRequest request) {

        System.out.println("========== LOGIN DEBUG ==========");
        System.out.println("Email received: " + request.getEmail());

        // Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        System.out.println("User found: " + user.getEmail());
        System.out.println("Role: " + user.getRole());

        // Check password manually for debugging
        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword());

        System.out.println(
                "Password matches: " + passwordMatches);

        // Authenticate using Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        System.out.println("Authentication Successful");

        // Generate JWT
        String token =
                jwtService.generateToken(user.getEmail());

        System.out.println("JWT Generated");

        // Return login response
        return new LoginResponse(
                token,
                user.getEmail(),
                user.getRole().name());
    }

    // ================= REGISTER =================

    @Override
    public ApiResponse register(RegisterRequest request) {

        // Check whether email already exists
        if (userRepository.existsByEmail(request.getEmail())) {

            return new ApiResponse(
                    false,
                    "Email already exists");
        }

        // Create new user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(
                        passwordEncoder.encode(
                                request.getPassword()))
                .role(Role.USER)
                .build();

        // Save user
        userRepository.save(user);

        return new ApiResponse(
                true,
                "User Registered Successfully");
    }
}