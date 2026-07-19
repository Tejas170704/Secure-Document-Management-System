package com.tejas.Secure_Document_Management_System.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tejas.Secure_Document_Management_System.dto.request.RegisterRequest;
import com.tejas.Secure_Document_Management_System.dto.response.ApiResponse;
import com.tejas.Secure_Document_Management_System.entity.User;
import com.tejas.Secure_Document_Management_System.enums.Role;
import com.tejas.Secure_Document_Management_System.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new ApiResponse(false, "Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        return new ApiResponse(true, "User Registered Successfully");
    }
}