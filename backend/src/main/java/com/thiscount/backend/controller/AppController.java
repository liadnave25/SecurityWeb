package com.thiscount.backend.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType; // חדש: לתיעוד Swagger
import org.springframework.http.ResponseEntity; // חדש: לתיעוד פרמטרים
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.thiscount.backend.model.Deal;
import com.thiscount.backend.model.User;
import com.thiscount.backend.repository.UserRepository;
import com.thiscount.backend.service.DealService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

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