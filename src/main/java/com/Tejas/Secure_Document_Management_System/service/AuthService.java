package com.tejas.Secure_Document_Management_System.service;

import com.tejas.Secure_Document_Management_System.dto.request.RegisterRequest;
import com.tejas.Secure_Document_Management_System.dto.response.ApiResponse;

public interface AuthService {

    ApiResponse register(RegisterRequest request);

}