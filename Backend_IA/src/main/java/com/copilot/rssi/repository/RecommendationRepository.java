package com.copilot.rssi.repository;

import com.copilot.rssi.entity.Recommendation;
import com.copilot.rssi.entity.enums.RecommendationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByRiskId(Long riskId);
    List<Recommendation> findByStatus(RecommendationStatus status);
}
