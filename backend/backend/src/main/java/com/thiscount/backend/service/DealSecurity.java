package com.thiscount.backend.service;

import com.thiscount.backend.model.Deal;
import com.thiscount.backend.repository.DealRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("dealSecurity")
public class DealSecurity {
    
    private final DealRepository dealRepository;

    public DealSecurity(DealRepository dealRepository) {
        this.dealRepository = dealRepository;
    }

    public boolean isOwner(Long dealId, Authentication authentication) {
        Deal deal = dealRepository.findById(dealId).orElse(null);
        if (deal == null) return false;
        
        return deal.getOwner().getEmail().equals(authentication.getName());
    }
}