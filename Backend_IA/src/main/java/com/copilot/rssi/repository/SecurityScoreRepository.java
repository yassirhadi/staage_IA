package com.copilot.rssi.repository;

import com.copilot.rssi.entity.SecurityScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SecurityScoreRepository extends JpaRepository<SecurityScore, Long> {
    
    Optional<SecurityScore> findFirstByOrderByCalculatedAtDesc();
}
