package com.thiscount.backend.service;

import com.thiscount.backend.dto.RegisterRequest; // הייבוא החדש
import com.thiscount.backend.model.User;
import com.thiscount.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    // ה-Patterns נשארים אותו דבר
    private static final String NAME_PATTERN = "^[a-zA-Z\\s'-]+$";
    private static final String PASSWORD_PATTERN = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$";
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean isFirstUser() {
        return userRepository.count() == 0;
    }

    // גם כאן אפשר לעבוד עם אובייקט, אבל נשאיר כרגע כך או נשנה גם ל-Request אם תרצה
    public User registerFirstAdmin(String fullName, String email, String rawPassword) {
        if (!isFirstUser()) {
            logger.warn("Attempt to create admin failed: Setup already completed.");
            throw new IllegalStateException("Setup already completed. Cannot create admin.");
        }
        validateInput(fullName, email, rawPassword);
        return createUser(fullName, email, rawPassword, "ROLE_ADMIN,ROLE_USER");
    }

    // --- השינוי הגדול כאן: מקבל אובייקט RegisterRequest ---
    public User registerUser(RegisterRequest request) {
        // שולפים את הנתונים מתוך האובייקט
        validateInput(request.fullName(), request.email(), request.password());

        if (userRepository.existsByEmail(request.email())) {
            logger.warn("Registration failed: Email already exists - {}", request.email());
            throw new IllegalArgumentException("Error: Email is already in use!");
        }
        
        return createUser(request.fullName(), request.email(), request.password(), "ROLE_USER");
    }

    private void validateInput(String fullName, String email, String rawPassword) {
        if (fullName == null || !fullName.matches(NAME_PATTERN)) {
            throw new IllegalArgumentException("Invalid name format. Only letters, spaces, hyphens allowed.");
        }
        if (email == null || !email.matches(EMAIL_PATTERN)) {
            throw new IllegalArgumentException("Invalid email format.");
        }
        if (rawPassword == null || !rawPassword.matches(PASSWORD_PATTERN)) {
            throw new IllegalArgumentException("Password must be at least 8 chars, contain Upper, Lower case and Number.");
        }
    }

    private User createUser(String fullName, String email, String rawPassword, String role) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setEnabled(true);
        User savedUser = userRepository.save(user);
        logger.info("New user registered successfully: email={}, role={}, id={}", email, role, savedUser.getId());
        return savedUser;
    }
}