package com.thiscount.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.List;

/**
 * מחלקה זו מקשרת בין ההגדרות שכתבת ב-application.properties (תחת הקידומת app.upload)
 * לבין משתנים בקוד, כדי שלא נצטרך לכתוב ערכים קשיחים (Hardcoded).
 */
@Configuration
@ConfigurationProperties(prefix = "app.upload")
public class FileUploadConfig {

    private String uploadDir;
    private int maxFilesPerRequest;
    private long maxBytesPerFile;
    private List<String> allowedExtensions;

    // --- Getters & Setters (חובה כדי ש-Spring יוכל להזריק את הערכים) ---

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public int getMaxFilesPerRequest() {
        return maxFilesPerRequest;
    }

    public void setMaxFilesPerRequest(int maxFilesPerRequest) {
        this.maxFilesPerRequest = maxFilesPerRequest;
    }

    public long getMaxBytesPerFile() {
        return maxBytesPerFile;
    }

    public void setMaxBytesPerFile(long maxBytesPerFile) {
        this.maxBytesPerFile = maxBytesPerFile;
    }

    public List<String> getAllowedExtensions() {
        return allowedExtensions;
    }

    public void setAllowedExtensions(List<String> allowedExtensions) {
        this.allowedExtensions = allowedExtensions;
    }
}