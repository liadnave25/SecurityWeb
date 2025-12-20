package com.thiscount.backend.controller;

import com.thiscount.backend.model.User;
import com.thiscount.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;

    public ProfileController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public User getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/debug")
    public Map<String, Object> debugAuth(Authentication authentication) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        // 1. Principal info
        Object principal = authentication.getPrincipal();
        debugInfo.put("principalType", principal.getClass().getName());
        
        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            debugInfo.put("username", userDetails.getUsername());
            debugInfo.put("enabled", userDetails.isEnabled());
            debugInfo.put("accountNonLocked", userDetails.isAccountNonLocked());
        } else {
            debugInfo.put("principal", principal.toString());
        }

        // 2. Authorities (Roles)
        String authoritiesString = authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .collect(Collectors.joining(", "));
        debugInfo.put("authorities", authoritiesString);

        // 3. Authenticated Status
        debugInfo.put("isAuthenticated", authentication.isAuthenticated());
        
        // 4. Name
        debugInfo.put("name", authentication.getName());

        return debugInfo;
    }
}