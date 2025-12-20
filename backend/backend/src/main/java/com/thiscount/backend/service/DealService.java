package com.thiscount.backend.service;

import com.thiscount.backend.model.Deal;
import com.thiscount.backend.model.User;
import com.thiscount.backend.repository.DealRepository;
import com.thiscount.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DealService {

    private final DealRepository dealRepository;
    private final UserRepository userRepository;

    public DealService(DealRepository dealRepository, UserRepository userRepository) {
        this.dealRepository = dealRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Deal createDeal(String title, String description) {
        User user = getCurrentUser();
        return dealRepository.save(new Deal(title, description, user));
    }

    public Deal updateDeal(Long dealId, String newTitle, String newDescription) {
        User currentUser = getCurrentUser();
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        boolean isAdmin = currentUser.getRole().contains("ADMIN");
        boolean isOwner = deal.getOwner().getId().equals(currentUser.getId());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to edit this deal. It belongs to someone else.");
        }

        deal.setTitle(newTitle);
        deal.setDescription(newDescription);
        return dealRepository.save(deal);
    }

    public void deleteDeal(Long dealId) {
        User currentUser = getCurrentUser();
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        // SECURITY CHECK
        boolean isAdmin = currentUser.getRole().contains("ADMIN");
        boolean isOwner = deal.getOwner().getId().equals(currentUser.getId());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not allowed to delete this deal.");
        }

        dealRepository.delete(deal);
    }

    public List<Deal> getMyDeals() {
        User user = getCurrentUser();
        return dealRepository.findByOwner(user);
    }

    public List<Deal> getAllDeals() {
        return dealRepository.findAll();
    }
}