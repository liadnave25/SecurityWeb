package com.thiscount.backend.service;

import com.thiscount.backend.config.FileUploadConfig;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

/**
 * שירות האחראי על כל ולידציות האבטחה של הקובץ לפני שמירתו.
 * משלב דרישות מעבדה (סיומות וגודל) עם אבטחה מתקדמת (Tika).
 */
@Service
public class FileValidationService {

    private final Tika tika = new Tika();
    private final FileUploadConfig config;

    public FileValidationService(FileUploadConfig config) {
        this.config = config;
    }

    /**
     * מבצע סדרה של בדיקות אבטחה על הקובץ.
     * @throws IllegalArgumentException אם הקובץ אינו עומד באחד מתנאי האבטחה.
     */
    public void validate(MultipartFile file) throws IOException {
        
        // 1. בדיקת גודל הקובץ (לפי ההגדרה ב-application.properties)
        if (file.getSize() > config.getMaxBytesPerFile()) {
            throw new IllegalArgumentException("File size exceeds the limit of " + (config.getMaxBytesPerFile() / 1024 / 1024) + "MB");
        }

        // 2. בדיקת סיומת הקובץ (Allowlist של המרצה)
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("File must have an extension");
        }
        
        String extension = originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase();
        if (!config.getAllowedExtensions().contains(extension)) {
            throw new IllegalArgumentException("File extension '." + extension + "' is not allowed");
        }

        // 3. בדיקת Magic Bytes (אימות תוכן אמיתי בעזרת Tika)
        // זוהי ההגנה נגד זיוף סיומות (למשל קובץ EXE ששינו לו את השם ל-JPG)
        String detectedType = tika.detect(file.getInputStream());
        if (detectedType == null || (!detectedType.startsWith("image/") && !detectedType.equals("application/pdf"))) {
            throw new IllegalArgumentException("Invalid file content signature. Detected: " + detectedType);
        }
    }
}