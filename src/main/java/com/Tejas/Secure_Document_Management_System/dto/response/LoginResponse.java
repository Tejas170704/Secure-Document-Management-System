package com.Tejas.Secure_Document_Management_System.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String email;
    private String role;
}