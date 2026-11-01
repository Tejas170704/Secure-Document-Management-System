package com.Tejas.Secure_Document_Management_System.dto.request;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareDocumentRequest {

    @NotNull(message = "Document ID is required")
    private Long documentId;
    
      @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;
}