package com.thiscount.backend.controller;

import com.thiscount.backend.model.Deal;
import com.thiscount.backend.model.User;
import com.thiscount.backend.repository.UserRepository;
import com.thiscount.backend.service.DealService;
import io.swagger.v3.oas.annotations.Operation; // חדש: לתיעוד Swagger
import io.swagger.v3.oas.annotations.Parameter; // חדש: לתיעוד פרמטרים
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppController {

    private final DealService dealService;
    private final UserRepository userRepository;

    public AppController(DealService dealService, UserRepository userRepository) {
        this.dealService = dealService;
        this.userRepository = userRepository;
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/deals/public")
    public List<Deal> getAllDeals() {
        return dealService.getAllDeals();
    }

    /**
     * יצירת דיל התומכת בהעלאת קובץ מאובטחת.
     * עודכן ל-@RequestPart ונוספו אנוטציות Swagger בהתאם לדרישות המעבדה.
     */
    @PostMapping(value = "/deals/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS')")
    @Operation(summary = "Create a new deal", description = "Creates a deal with an optional secure file upload. Supports title, description and a file part.")
    public ResponseEntity<?> createDeal(
            @Parameter(description = "The title of the deal") 
            @RequestPart("title") String title,
            
            @Parameter(description = "A detailed description of the deal") 
            @RequestPart("description") String description,
            
            @Parameter(description = "Optional image or document file") 
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        try {
            Deal deal = dealService.createDeal(title, description, file);
            return ResponseEntity.ok(deal);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Server I/O error: " + e.getMessage()));
        } catch (IllegalArgumentException | SecurityException e) {
            // טיפול בשגיאות ולידציה או חריגות אבטחה של ה-PathSandbox
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/deals/{id}")
    @PreAuthorize("hasRole('ADMIN') or @dealSecurity.isOwner(#id, authentication)")
    public ResponseEntity<?> updateDeal(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Deal updatedDeal = dealService.updateDeal(id, payload.get("title"), payload.get("description"));
        return ResponseEntity.ok(updatedDeal);
    }

    @DeleteMapping("/deals/{id}")
    @PreAuthorize("hasRole('ADMIN') or @dealSecurity.isOwner(#id, authentication)")
    public ResponseEntity<?> deleteDeal(@PathVariable Long id) {
        dealService.deleteDeal(id);
        return ResponseEntity.ok(Map.of("message", "Deal deleted successfully"));
    }

    @GetMapping("/deals/my-deals")
    public List<Deal> getMyDeals() {
        return dealService.getMyDeals();
    }

    @GetMapping("/debug/me")
    public ResponseEntity<?> debugAuth(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "username", authentication.getName(),
            "roles", authentication.getAuthorities()
        ));
    }

    /**
     * Endpoint להגשת תמונות מהתיקייה המאובטחת.
     */
    @GetMapping("/deals/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Resource file = dealService.loadImage(filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) 
                    .body(file);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}