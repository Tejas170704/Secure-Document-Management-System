package com.Tejas.Secure_Document_Management_System.security.encryption;

import java.nio.charset.StandardCharsets;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class AesEncryptionService {

    @Value("${aes.secret}")
    private String secret;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {

        if (secret.length() != 32) {
            throw new IllegalArgumentException(
                    "AES secret key must be exactly 32 characters long.");
        }

        secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                "AES");
    }

    public byte[] encrypt(byte[] data) throws Exception {

        Cipher cipher = Cipher.getInstance("AES");

        cipher.init(Cipher.ENCRYPT_MODE, secretKey);

        return cipher.doFinal(data);
    }

    public byte[] decrypt(byte[] encryptedData) throws Exception {

        Cipher cipher = Cipher.getInstance("AES");

        cipher.init(Cipher.DECRYPT_MODE, secretKey);

        return cipher.doFinal(encryptedData);
    }
}