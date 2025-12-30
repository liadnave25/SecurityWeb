package com.thiscount.backend.service;

import com.thiscount.backend.config.FileUploadConfig;
import com.thiscount.backend.model.Deal;
import com.thiscount.backend.model.User;
import com.thiscount.backend.repository.DealRepository;
import com.thiscount.backend.repository.UserRepository;
import com.thiscount.backend.util.PathSandbox;
import io.github.bucket4j.Bucket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class DealService {
    private static final Logger logger = LoggerFactory.getLogger(DealService.class);

    private final DealRepository dealRepository;
    private final UserRepository userRepository;
    private final RateLimitingService rateLimitingService;
    private final FileValidationService fileValidationService; // חדש משלב 4
    private final FileUploadConfig uploadConfig; // חדש משלב 2

    // עדכון הקונסטרקטור להזרקת כל הרכיבים החדשים
    public DealService(DealRepository dealRepository, 
                       UserRepository userRepository, 
                       RateLimitingService rateLimitingService,
                       FileValidationService fileValidationService,
                       FileUploadConfig uploadConfig) {
        this.dealRepository = dealRepository;
        this.userRepository = userRepository;
        this.rateLimitingService = rateLimitingService;
        this.fileValidationService = fileValidationService;
        this.uploadConfig = uploadConfig;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * יצירת דיל חדש עם העלאת קובץ מאובטחת.
     * משלב: Rate Limiting, Validation Service, Path Sandbox, ו-Image Sanitization.
     */
    public Deal createDeal(String title, String description, MultipartFile file) throws IOException {
        User user = getCurrentUser(); 
        String fileName = null;

        if (file != null && !file.isEmpty()) {
            
            // 1. בדיקת Rate Limiting
            Bucket bucket = rateLimitingService.resolveBucket(user.getEmail());
            if (!bucket.tryConsume(1)) {
                logger.warn("Rate limit exceeded for user: {}.", user.getEmail());
                throw new RuntimeException("Too many uploads. Please wait a few minutes.");
            }

            // 2. ולידציה מרוכזת (Magic Bytes + Extensions + Size) - שלב 4 של המעבדה
            fileValidationService.validate(file);

            // 3. הגדרת נתיב מאובטח באמצעות Sandbox - שלב 3 של המעבדה
            Path root = PathSandbox.boxRoot(uploadConfig.getUploadDir());
            
            // יצירת שם קובץ אקראי
            String extension = getFileExtension(file.getOriginalFilename());
            fileName = UUID.randomUUID().toString() + extension;

            // וידוא שהנתיב הסופי "כלוא" בתוך ה-Sandbox
            Path finalPath = PathSandbox.resolveSafe(root, fileName);

            // יצירת התיקייה אם אינה קיימת (מתוך ה-Config)
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            // 4. Re-encoding & Metadata Stripping (Sanitization)
            try (var inputStream = file.getInputStream()) {
                BufferedImage bufferedImage = ImageIO.read(inputStream);
                if (bufferedImage == null) {
                    logger.error("Failed to decode image from user: {}", user.getEmail());
                    throw new IllegalArgumentException("Corrupted or malicious image data.");
                }
                
                String formatName = extension.replace(".", "");
                boolean result = ImageIO.write(bufferedImage, formatName, finalPath.toFile());
                if (!result) {
                    throw new IOException("Failed to write sanitized image to disk.");
                }
            }

            // 5. ביטול הרשאות הרצה (No-Execute)
            finalPath.toFile().setExecutable(false);
            finalPath.toFile().setReadable(true);

            logger.info("User {} uploaded a sanitized image via Sandbox: {}, safeName: {}", 
                        user.getEmail(), file.getOriginalFilename(), fileName);
        }

        Deal deal = new Deal(title, description, user);
        deal.setImagePath(fileName);
        return dealRepository.save(deal);
    }

    /**
     * טעינת קובץ מהתיקייה המאובטחת (משתמש ב-Config וב-Sandbox).
     */
    public Resource loadImage(String fileName) {
        try {
            Path root = PathSandbox.boxRoot(uploadConfig.getUploadDir());
            Path filePath = PathSandbox.resolveSafe(root, fileName);
            
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error locating file: " + fileName, e);
        }
    }

    // --- מתודות קיימות שנשמרו ללא שינוי ---

    public Deal updateDeal(Long dealId, String newTitle, String newDescription) {
        User currentUser = getCurrentUser();
        Deal deal = dealRepository.findById(dealId).orElseThrow(() -> new RuntimeException("Deal not found"));
        if (!deal.getOwner().getId().equals(currentUser.getId()) && !currentUser.getRole().contains("ADMIN")) {
            throw new AccessDeniedException("Unauthorized");
        }
        deal.setTitle(newTitle);
        deal.setDescription(newDescription);
        return dealRepository.save(deal);
    }

    public void deleteDeal(Long dealId) {
        User currentUser = getCurrentUser();
        Deal deal = dealRepository.findById(dealId).orElseThrow(() -> new RuntimeException("Deal not found"));
        if (!deal.getOwner().getId().equals(currentUser.getId()) && !currentUser.getRole().contains("ADMIN")) {
            throw new AccessDeniedException("Unauthorized");
        }
        dealRepository.delete(deal);
    }

    public List<Deal> getMyDeals() {
        return dealRepository.findByOwner(getCurrentUser());
    }

    public List<Deal> getAllDeals() {
        return dealRepository.findAll();
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return ".jpg";
        int lastIndex = fileName.lastIndexOf(".");
        return (lastIndex == -1) ? ".jpg" : fileName.substring(lastIndex).toLowerCase();
    }
}