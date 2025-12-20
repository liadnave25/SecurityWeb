package com.thiscount.backend.controller;

import com.thiscount.backend.model.Deal;
import com.thiscount.backend.model.User;
import com.thiscount.backend.repository.UserRepository;
import com.thiscount.backend.service.DealService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/deals/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'BUSINESS')") // RBAC
    public ResponseEntity<?> createDeal(@RequestBody Map<String, String> payload) {
        Deal deal = dealService.createDeal(payload.get("title"), payload.get("description"));
        return ResponseEntity.ok(deal);
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
}