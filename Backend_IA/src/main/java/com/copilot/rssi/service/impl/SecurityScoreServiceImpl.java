package com.copilot.rssi.service.impl;

import com.copilot.rssi.entity.Document;
import com.copilot.rssi.entity.Risk;
import com.copilot.rssi.entity.Recommendation;
import com.copilot.rssi.entity.Referential;
import com.copilot.rssi.entity.SecurityScore;
import com.copilot.rssi.repository.*;
import com.copilot.rssi.service.interfaces.SecurityScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SecurityScoreServiceImpl implements SecurityScoreService {

    private final SecurityScoreRepository securityScoreRepository;
    private final DocumentRepository documentRepository;
    private final RiskRepository riskRepository;
    private final RecommendationRepository recommendationRepository;
    private final ReferentialRepository referentialRepository;

    @Override
    public Optional<SecurityScore> getLatestScore() {
        return securityScoreRepository.findFirstByOrderByCalculatedAtDesc();
    }

    @Override
    public SecurityScore calculateAndSaveScore() {
        List<Document> documents = documentRepository.findAll();
        List<Risk> risks = riskRepository.findAll();
        List<Recommendation> recommendations = recommendationRepository.findAll();
        List<Referential> referentials = referentialRepository.findAll();

        SecurityScore score = SecurityScore.builder()
                .documentsScore(calculateDocumentsScore(documents))
                .risksScore(calculateRisksScore(risks))
                .complianceScore(calculateComplianceScore(referentials))
                .recommendationsScore(calculateRecommendationsScore(recommendations))
                .overallScore(0)
                .build();

        score.setOverallScore(calculateOverallScore(score));

        return securityScoreRepository.save(score);
    }

    @Override
    public SecurityScore saveScore(SecurityScore score) {
        return securityScoreRepository.save(score);
    }

    private Integer calculateDocumentsScore(List<Document> documents) {
        if (documents.isEmpty()) return 100;
        long classified = documents.stream()
                .filter(d -> d.getConfidentialityLevel() != null)
                .count();
        return Math.toIntExact(Math.round((classified * 100.0) / documents.size()));
    }

    private Integer calculateRisksScore(List<Risk> risks) {
        if (risks.isEmpty()) return 100;
        long resolved = risks.stream()
                .filter(r -> r.getStatus() == com.copilot.rssi.entity.enums.RiskStatus.RESOLU ||
                        r.getStatus() == com.copilot.rssi.entity.enums.RiskStatus.IGNORE)
                .count();
        return Math.toIntExact(Math.round((resolved * 100.0) / risks.size()));
    }

    private Integer calculateComplianceScore(List<Referential> referentials) {
        if (referentials.isEmpty()) return 100;
        double avg = referentials.stream()
            .mapToInt(referential -> Optional.ofNullable(referential.getComplianceScore()).orElse(0))
            .average()
            .orElse(100.0);
        return (int) Math.round(avg);
    }

    private Integer calculateRecommendationsScore(List<Recommendation> recommendations) {
        if (recommendations.isEmpty()) return 100;
        long completed = recommendations.stream()
                .filter(r -> r.getStatus() == com.copilot.rssi.entity.enums.RecommendationStatus.APPLIQUEE ||
                           r.getStatus() == com.copilot.rssi.entity.enums.RecommendationStatus.TERMINEE)
                .count();
        return Math.toIntExact(Math.round((completed * 100.0) / recommendations.size()));
    }

    private Integer calculateOverallScore(SecurityScore score) {
        int total = score.getDocumentsScore() + score.getRisksScore() + score.getComplianceScore() + score.getRecommendationsScore();
        return total / 4;
    }
}
