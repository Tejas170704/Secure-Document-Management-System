package com.Tejas.Secure_Document_Management_System.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionResponse {

    private boolean success;

    private String message;

    private LocalDateTime timestamp;
}