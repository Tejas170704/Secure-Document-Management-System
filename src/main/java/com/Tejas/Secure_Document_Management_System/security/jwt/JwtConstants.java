package com.Tejas.Secure_Document_Management_System.security.jwt;

public class JwtConstants {

    public static final String SECRET =
            "ThisIsMyVerySecureSecretKeyForJWTAuthenticationInSpringBoot2026";

    public static final long EXPIRATION =
            1000 * 60 * 60 * 24; // 24 hours
}