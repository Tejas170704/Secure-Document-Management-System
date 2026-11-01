package com.Tejas.Secure_Document_Management_System.service;

import com.Tejas.Secure_Document_Management_System.dto.request.LoginRequest;
import com.Tejas.Secure_Document_Management_System.dto.request.RegisterRequest;
import com.Tejas.Secure_Document_Management_System.dto.response.ApiResponse;
import com.Tejas.Secure_Document_Management_System.dto.response.LoginResponse;

public interface AuthService {

    ApiResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);

}