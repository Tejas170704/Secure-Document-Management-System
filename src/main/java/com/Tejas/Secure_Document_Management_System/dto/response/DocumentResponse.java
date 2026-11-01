package com.Tejas.Secure_Document_Management_System.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentResponse {

    private Long id;

    private String title;

    private String originalFileName;

    private Long fileSize;

    private LocalDateTime uploadedAt;

    private boolean encrypted;
}