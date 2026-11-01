package com.Tejas.Secure_Document_Management_System.dto.response;

import org.springframework.core.io.ByteArrayResource;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileDownloadResponse {

    private ByteArrayResource resource;

    private String fileName;

    private String contentType;
}