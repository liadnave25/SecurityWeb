package com.thiscount.backend.repository;

import com.thiscount.backend.model.Deal;
import com.thiscount.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DealRepository extends JpaRepository<Deal, Long> {
    List<Deal> findByOwner(User owner);
}