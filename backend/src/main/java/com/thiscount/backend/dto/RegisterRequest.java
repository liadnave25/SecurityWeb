package com.thiscount.backend.dto;

public record RegisterRequest(
    String fullName, 
    String email, 
    String password
) {}