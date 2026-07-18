package com.copilot.rssi.service.impl;

import com.copilot.rssi.entity.Document;
import com.copilot.rssi.entity.Recommendation;
import com.copilot.rssi.entity.Referential;
import com.copilot.rssi.entity.Risk;
import com.copilot.rssi.entity.SecurityScore;
import com.copilot.rssi.entity.enums.RecommendationStatus;
import com.copilot.rssi.entity.enums.RiskStatus;
import com.copilot.rssi.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityScoreServiceImplTest {

    @Mock
    private SecurityScoreRepository securityScoreRepository;

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private RiskRepository riskRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    @Mock
    private ReferentialRepository referentialRepository;

    @InjectMocks
    private SecurityScoreServiceImpl service;

    @Test
    void calculateAndSaveScoreHandlesNullComplianceScores() {
        Document document = new Document();
        document.setConfidentialityLevel(com.copilot.rssi.entity.enums.ConfidentialityLevel.CONFIDENTIEL);

        Risk risk = new Risk();
        risk.setStatus(RiskStatus.OUVERT);

        Recommendation recommendation = new Recommendation();
        recommendation.setStatus(RecommendationStatus.PROPOSEE);

        Referential referential = new Referential();
        referential.setComplianceScore(null);

        when(documentRepository.findAll()).thenReturn(List.of(document));
        when(riskRepository.findAll()).thenReturn(List.of(risk));
        when(recommendationRepository.findAll()).thenReturn(List.of(recommendation));
        when(referentialRepository.findAll()).thenReturn(List.of(referential));
        when(securityScoreRepository.save(org.mockito.ArgumentMatchers.any(SecurityScore.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SecurityScore score = service.calculateAndSaveScore();

        assertEquals(100, score.getDocumentsScore());
        assertEquals(0, score.getRisksScore());
        assertEquals(0, score.getComplianceScore());
        assertEquals(0, score.getRecommendationsScore());
        assertEquals(25, score.getOverallScore());
    }
}
