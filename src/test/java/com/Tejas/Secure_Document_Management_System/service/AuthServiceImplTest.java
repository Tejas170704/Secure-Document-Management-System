package com.Tejas.Secure_Document_Management_System.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.Tejas.Secure_Document_Management_System.dto.request.RegisterRequest;
import com.Tejas.Secure_Document_Management_System.dto.response.ApiResponse;
import com.Tejas.Secure_Document_Management_System.entity.User;
import com.Tejas.Secure_Document_Management_System.repository.UserRepository;
import com.Tejas.Secure_Document_Management_System.service.impl.AuthServiceImpl;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerShouldReturnSuccessWhenEmailIsNew() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        ApiResponse response = authService.register(request);

        assertTrue(response.isSuccess());
        assertEquals("User Registered Successfully", response.getMessage());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerShouldReturnFailureWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Jane Doe");
        request.setEmail("jane@example.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        ApiResponse response = authService.register(request);

        assertFalse(response.isSuccess());
        assertEquals("Email already exists", response.getMessage());
        verify(userRepository).existsByEmail("jane@example.com");
    }
}
