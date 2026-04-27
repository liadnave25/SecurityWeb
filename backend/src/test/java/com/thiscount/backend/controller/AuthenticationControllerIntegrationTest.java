package com.thiscount.backend.controller;

import com.thiscount.backend.config.SecurityConfig;
import com.thiscount.backend.service.AuthService;
import com.thiscount.backend.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Black Box Integration Test — AuthController
// @WebMvcTest loads only the web layer; @Import brings in the real SecurityConfig
// so CSRF, CORS, and Argon2 all run exactly as in production.
@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AuthenticationControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private PasswordEncoder passwordEncoder;

    @MockBean private CustomUserDetailsService customUserDetailsService;
    @MockBean private AuthService authService;

    private static final String TEST_EMAIL    = "alice@thiscount.com";
    private static final String TEST_PASSWORD = "SecurePass1";

    private String encodedTestPassword;

    @BeforeEach
    void setUpMocks() {
        // Arrange — encode with real Argon2 so DaoAuthenticationProvider runs genuine verification
        encodedTestPassword = passwordEncoder.encode(TEST_PASSWORD);

        UserDetails mockUser = User.builder()
            .username(TEST_EMAIL)
            .password(encodedTestPassword)
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
            .build();

        when(customUserDetailsService.loadUserByUsername(TEST_EMAIL)).thenReturn(mockUser);
        when(authService.isFirstUser()).thenReturn(false);
    }

    @Test
    @DisplayName("GET /api/auth/status: returns system status JSON")
    void getStatus_returns200WithSystemStatusJson() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/auth/status"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.isSetupRequired").value(false));
    }

    @Test
    @DisplayName("POST /api/auth/login: valid credentials return 200")
    void login_withValidCredentials_returns200() throws Exception {
        // Arrange
        String body = """
            { "email": "%s", "password": "%s" }
            """.formatted(TEST_EMAIL, TEST_PASSWORD);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Login Successful!"))
            .andExpect(jsonPath("$.user").value(TEST_EMAIL));
    }

    @Test
    @DisplayName("POST /api/auth/login: wrong password returns 401")
    void login_withWrongPassword_returns401() throws Exception {
        // Arrange
        String body = """
            { "email": "%s", "password": "WrongPassword999" }
            """.formatted(TEST_EMAIL);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .with(csrf()))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    @DisplayName("POST /api/auth/login: unknown email returns 401 (no user enumeration)")
    void login_withUnknownEmail_returns401() throws Exception {
        // Arrange
        String unknownEmail = "ghost@nowhere.com";
        when(customUserDetailsService.loadUserByUsername(unknownEmail))
            .thenThrow(new UsernameNotFoundException("User not found"));

        String body = """
            { "email": "%s", "password": "AnyPassword1" }
            """.formatted(unknownEmail);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .with(csrf()))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    @Test
    @DisplayName("POST /api/auth/login: missing CSRF token returns 403")
    void login_withoutCsrfToken_returns403() throws Exception {
        // Arrange
        String body = """
            { "email": "%s", "password": "%s" }
            """.formatted(TEST_EMAIL, TEST_PASSWORD);

        // Act & Assert — no .with(csrf()), CsrfFilter intercepts before the controller
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isForbidden());

        verify(customUserDetailsService, never()).loadUserByUsername(anyString());
    }
}
