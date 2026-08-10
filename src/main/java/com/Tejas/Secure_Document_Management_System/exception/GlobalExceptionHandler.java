package com.Tejas.Secure_Document_Management_System.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.Tejas.Secure_Document_Management_System.dto.response.ExceptionResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Runtime Exceptions
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ExceptionResponse> handleRuntimeException(
            RuntimeException ex) {

        ExceptionResponse response = ExceptionResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // General Exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleException(
            Exception ex) {

        ExceptionResponse response = ExceptionResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        return new ResponseEntity<>(response,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidation(
        MethodArgumentNotValidException ex) {

    Map<String, String> errors = new HashMap<>();

    ex.getBindingResult()
            .getFieldErrors()
            .forEach(error ->
                    errors.put(
                            error.getField(),
                            error.getDefaultMessage()));

    Map<String, Object> response = new HashMap<>();

    response.put("success", false);
    response.put("timestamp", LocalDateTime.now());
    response.put("errors", errors);

    return ResponseEntity.badRequest().body(response);
}
}