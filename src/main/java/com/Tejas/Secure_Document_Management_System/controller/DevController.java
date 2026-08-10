package com.Tejas.Secure_Document_Management_System.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Tejas.Secure_Document_Management_System.entity.User;
import com.Tejas.Secure_Document_Management_System.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class DevController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/reset-password")
    public String resetPassword() {

        User user = userRepository.findByEmail("dhuletejas@gmail.com")
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode("admin123"));

        userRepository.save(user);

        return "Password reset successfully.";
    }
}