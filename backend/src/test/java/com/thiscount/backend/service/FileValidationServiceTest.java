package com.thiscount.backend.service;

import com.thiscount.backend.config.FileUploadConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// White Box Unit Test — FileValidationService
// Targets every branch in validate(): size → extension → Tika magic-bytes.
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class FileValidationServiceTest {

    @Mock
    private FileUploadConfig config;

    @InjectMocks
    private FileValidationService fileValidationService;

    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_EXTS = List.of("jpg", "jpeg", "png");

    @BeforeEach
    void setUpConfigMock() {
        when(config.getMaxBytesPerFile()).thenReturn(MAX_SIZE_BYTES);
        when(config.getAllowedExtensions()).thenReturn(ALLOWED_EXTS);
    }

    @Test
    @DisplayName("Branch 1: file exceeding size limit is rejected")
    void validate_whenFileSizeExceedsLimit_throwsIllegalArgumentException() throws IOException {
        // Arrange
        MultipartFile oversizedFile = mock(MultipartFile.class);
        when(oversizedFile.getSize()).thenReturn(MAX_SIZE_BYTES + 1);

        // Act & Assert
        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationService.validate(oversizedFile)
        );
        assertTrue(ex.getMessage().contains("MB"));
        verify(oversizedFile, never()).getOriginalFilename();
    }

    @Test
    @DisplayName("Branch 2a: null filename is rejected")
    void validate_whenFilenameIsNull_throwsIllegalArgumentException() throws IOException {
        // Arrange
        MultipartFile fileWithNullName = mock(MultipartFile.class);
        when(fileWithNullName.getSize()).thenReturn(1024L);
        when(fileWithNullName.getOriginalFilename()).thenReturn(null);

        // Act & Assert
        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationService.validate(fileWithNullName)
        );
        assertTrue(ex.getMessage().contains("extension"));
    }

    @Test
    @DisplayName("Branch 2b: filename without extension is rejected")
    void validate_whenFilenameHasNoExtension_throwsIllegalArgumentException() throws IOException {
        // Arrange
        MultipartFile fileWithoutExtension = mock(MultipartFile.class);
        when(fileWithoutExtension.getSize()).thenReturn(1024L);
        when(fileWithoutExtension.getOriginalFilename()).thenReturn("malware");

        // Act & Assert
        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationService.validate(fileWithoutExtension)
        );
        assertNotNull(ex);
    }

    @Test
    @DisplayName("Branch 3: disallowed extension (.exe) is rejected")
    void validate_whenExtensionNotInAllowlist_throwsIllegalArgumentException() throws IOException {
        // Arrange
        MultipartFile executableFile = mock(MultipartFile.class);
        when(executableFile.getSize()).thenReturn(1024L);
        when(executableFile.getOriginalFilename()).thenReturn("ransomware.exe");

        // Act
        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationService.validate(executableFile)
        );

        // Assert
        assertTrue(ex.getMessage().contains(".exe"));
        verify(executableFile, never()).getInputStream(); // Tika must not be reached
    }

    @Test
    @DisplayName("Happy path: genuine PNG file passes all checks")
    void validate_whenFileIsGenuinePng_doesNotThrow() {
        // Arrange — real PNG magic bytes so Tika detects a genuine image
        byte[] pngMagicBytes = {
            (byte) 0x89, 'P', 'N', 'G',
            (byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x0A
        };
        MockMultipartFile validPng = new MockMultipartFile(
            "file", "photo.png", "image/png", pngMagicBytes
        );

        // Act & Assert
        assertDoesNotThrow(() -> fileValidationService.validate(validPng));
    }

    @Test
    @DisplayName("Tika branch: EXE masquerading as PNG is rejected")
    void validate_whenContentIsNotAnImage_throwsIllegalArgumentException() {
        // Arrange — plain-text bytes named .png; Tika sees through the fake extension
        byte[] fakeImageBytes = "This is plain text, not an image.".getBytes();
        MockMultipartFile fakeImage = new MockMultipartFile(
            "file", "virus.png", "image/png", fakeImageBytes
        );

        // Act & Assert
        IllegalArgumentException ex = assertThrows(
            IllegalArgumentException.class,
            () -> fileValidationService.validate(fakeImage)
        );
        assertTrue(ex.getMessage().contains("signature"));
    }
}
