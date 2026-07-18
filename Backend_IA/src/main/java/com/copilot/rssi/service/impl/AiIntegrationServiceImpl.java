package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.request.ChatRequest;
import com.copilot.rssi.dto.response.RiskResponse;
import com.copilot.rssi.entity.AnalysisResult;
import com.copilot.rssi.entity.Document;
import com.copilot.rssi.entity.Recommendation;
import com.copilot.rssi.entity.Risk;
import com.copilot.rssi.entity.SensitiveData;
import com.copilot.rssi.entity.enums.*;
import com.copilot.rssi.repository.AnalysisResultRepository;
import com.copilot.rssi.repository.DocumentRepository;
import com.copilot.rssi.repository.RecommendationRepository;
import com.copilot.rssi.repository.RiskRepository;
import com.copilot.rssi.repository.SensitiveDataRepository;
import com.copilot.rssi.service.interfaces.AiIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiIntegrationServiceImpl implements AiIntegrationService {

    private final DocumentRepository documentRepository;
    private final SensitiveDataRepository sensitiveDataRepository;
    private final RiskRepository riskRepository;
    private final RecommendationRepository recommendationRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.ai-service.base-url:http://localhost:8000}")
    private String aiBaseUrl;

    @Transactional
    public void analyzeAndPersist(Document document) {
        try {
            document.setAnalysisStatus(AnalysisStatus.IN_PROGRESS);
            documentRepository.save(document);

            Map<String, Object> result = callAnalyzeApi(document.getFilePath());
            if (result.containsKey("error")) {
                document.setAnalysisStatus(AnalysisStatus.FAILED);
                documentRepository.save(document);
                return;
            }

            applyAnalysisResult(document, result);
        } catch (Exception e) {
            document.setAnalysisStatus(AnalysisStatus.FAILED);
            documentRepository.save(document);
            System.err.println("Échec analyse IA pour " + document.getFileName() + ": " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Map<String, Object> analyzeDocument(Long documentId, String filePath) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable"));
        analyzeAndPersist(document);
        Map<String, Object> result = new HashMap<>();
        result.put("documentId", document.getId());
        result.put("analysisStatus", document.getAnalysisStatus().name());
        result.put("documentType", document.getDocumentType());
        result.put("confidentialityLevel", document.getConfidentialityLevel());
        return result;
    }

    @Override
    public Map<String, Object> chat(ChatRequest request) {
        Map<String, Object> resultMap = new HashMap<>();
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> payload = new HashMap<>();
            payload.put("question", request.getQuestion());

            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiBaseUrl + "/api/v1/chat", requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String answer = body.get("answer") != null
                        ? body.get("answer").toString()
                        : (body.get("reply") != null ? body.get("reply").toString() : "Pas de réponse.");
                resultMap.put("answer", answer);
                if (body.get("sources") != null) {
                    resultMap.put("sources", body.get("sources"));
                }
            } else {
                resultMap.put("answer", "Erreur de communication avec le Copilote IA.");
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'appel au service IA pour le chat", e);
            resultMap.put("answer", "Service IA indisponible. Démarrez le service Python (port 8000).");
        }
        return resultMap;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiskResponse> getAllRisks() {
        return riskRepository.findAll().stream()
                .map(this::toRiskResponse)
                .toList();
    }

    @SuppressWarnings("unchecked")
    private void applyAnalysisResult(Document document, Map<String, Object> result) {
        Object extracted = result.get("extracted_text");
        if (extracted == null) {
            extracted = result.get("extractedText");
        }
        if (extracted != null) {
            String text = extracted.toString();
            document.setExtractedText(text.length() > 65000 ? text.substring(0, 65000) : text);
        }

        Object docType = result.get("document_type");
        if (docType == null) {
            docType = result.get("documentType");
        }
        document.setDocumentType(mapDocumentType(docType != null ? docType.toString() : null));

        Object confLevel = result.get("confidentiality_level");
        if (confLevel == null) {
            confLevel = result.get("confidentialityLevel");
        }
        document.setConfidentialityLevel(mapConfidentiality(confLevel != null ? confLevel.toString() : null));
        document.setAnalysisStatus(AnalysisStatus.COMPLETED);
        documentRepository.save(document);

        saveAnalysisResult(document, result);
        sensitiveDataRepository.deleteByDocumentId(document.getId());
        riskRepository.deleteByDocumentId(document.getId());

        List<Map<String, Object>> sensitiveItems = (List<Map<String, Object>>) result.get("sensitive_data");
        if (sensitiveItems == null) {
            sensitiveItems = (List<Map<String, Object>>) result.get("sensitiveData");
        }
        if (sensitiveItems != null) {
            for (Map<String, Object> item : sensitiveItems) {
                saveSensitiveData(document, item);
            }
        }

        List<Map<String, Object>> risks = (List<Map<String, Object>>) result.get("risks");
        List<Map<String, Object>> recommendations = (List<Map<String, Object>>) result.get("recommendations");

        if (risks != null) {
            for (int i = 0; i < risks.size(); i++) {
                Map<String, Object> riskData = risks.get(i);
                Risk risk = saveRisk(document, riskData);
                if (recommendations != null && i < recommendations.size()) {
                    saveRecommendation(risk, recommendations.get(i));
                } else {
                    saveDefaultRecommendation(risk);
                }
            }
        }
    }

    private Map<String, Object> callAnalyzeApi(String filePath) {
        Map<String, Object> resultMap = new HashMap<>();
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> payload = Map.of("file_path", filePath);
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiBaseUrl + "/api/v1/analyze", requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                resultMap.putAll(response.getBody());
            } else {
                resultMap.put("error", "Réponse IA invalide");
            }
        } catch (Exception e) {
            resultMap.put("error", e.getMessage());
        }
        return resultMap;
    }

    private void saveAnalysisResult(Document document, Map<String, Object> result) {
        List<Map<String, Object>> sensitiveItems = (List<Map<String, Object>>) result.get("sensitive_data");
        if (sensitiveItems == null) {
            sensitiveItems = (List<Map<String, Object>>) result.get("sensitiveData");
        }
        List<Map<String, Object>> risks = (List<Map<String, Object>>) result.get("risks");
        List<Map<String, Object>> recommendations = (List<Map<String, Object>>) result.get("recommendations");

        String detectedDataTypes = sensitiveItems == null ? "" : sensitiveItems.stream()
                .map(item -> item.get("data_type") != null ? item.get("data_type").toString() : item.get("dataType") != null ? item.get("dataType").toString() : "")
                .filter(value -> !value.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));

        String risksDetails = risks == null ? "" : risks.stream()
                .map(item -> item.get("title") != null ? item.get("title").toString() : "")
                .filter(value -> !value.isBlank())
                .collect(Collectors.joining("\n"));

        String complianceStandards = result.get("compliance_standards") != null ? result.get("compliance_standards").toString() : "ISO27001, NIST";
        Integer securityScore = result.get("security_score") != null ? Integer.valueOf(result.get("security_score").toString()) : (risks != null ? Math.max(0, 100 - risks.size() * 12) : 0);

        AnalysisResult analysisResult = analysisResultRepository.findByDocumentId(document.getId()).orElseGet(AnalysisResult::new);
        analysisResult.setDocument(document);
        analysisResult.setDocumentType(document.getDocumentType() != null ? document.getDocumentType().name() : null);
        analysisResult.setConfidentialityLevel(document.getConfidentialityLevel() != null ? document.getConfidentialityLevel().name() : null);
        analysisResult.setPiiDetected(!sensitiveItems.isEmpty());
        analysisResult.setRisksCount(risks != null ? risks.size() : 0);
        analysisResult.setComplianceStandards(complianceStandards);
        analysisResult.setSecurityScore(securityScore);
        analysisResult.setDetectedDataTypes(detectedDataTypes);
        analysisResult.setRisksDetails(risksDetails);
        analysisResultRepository.save(analysisResult);
    }

    private void saveSensitiveData(Document document, Map<String, Object> item) {
        Object typeObj = item.get("data_type");
        if (typeObj == null) {
            typeObj = item.get("dataType");
        }
        if (typeObj == null) {
            return;
        }
        String typeStr = typeObj.toString();

        SensitiveDataType dataType;
        try {
            dataType = SensitiveDataType.valueOf(typeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            dataType = SensitiveDataType.AUTRE;
        }

        Object confidence = item.get("confidence");
        sensitiveDataRepository.save(SensitiveData.builder()
                .document(document)
                .dataType(dataType)
                .detectedValue(getString(item, "detected_value", "detectedValue"))
                .maskedValue(getString(item, "masked_value", "maskedValue"))
                .confidence(confidence != null ? new BigDecimal(confidence.toString()) : BigDecimal.valueOf(0.85))
                .build());
    }

    private Risk saveRisk(Document document, Map<String, Object> riskData) {
        String rawTitle = normalizeText(getString(riskData, "title", null));
        String title = rawTitle.isBlank() ? "Risque détecté par l'analyse IA" : rawTitle;

        String description = normalizeText(getString(riskData, "description", null));
        String severityStr = riskData.get("severity") != null ? riskData.get("severity").toString() : "MOYEN";
        RiskSeverity severity;
        try {
            severity = RiskSeverity.valueOf(severityStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            severity = RiskSeverity.MOYEN;
        }

        List<Risk> existingRisks = riskRepository.findByDocumentId(document.getId());
        Optional<Risk> existingRisk = existingRisks.stream()
                .filter(r -> title.equalsIgnoreCase(normalizeText(r.getTitle())))
                .findFirst();

        if (existingRisk.isPresent()) {
            Risk risk = existingRisk.get();
            risk.setDescription(description);
            risk.setSeverity(severity);
            risk.setCategory(normalizeText(getString(riskData, "category", null)));
            risk.setStatus(RiskStatus.OUVERT);
            return riskRepository.save(risk);
        }

        return riskRepository.save(Risk.builder()
                .document(document)
                .title(title)
                .description(description)
                .severity(severity)
                .category(normalizeText(getString(riskData, "category", null)))
                .status(RiskStatus.OUVERT)
                .build());
    }

    private void saveRecommendation(Risk risk, Map<String, Object> recData) {
        String description = normalizeText(getString(recData, "description", null));
        if (description.isBlank()) {
            return;
        }
        String priorityStr = recData.get("priority") != null ? recData.get("priority").toString() : "MOYENNE";
        RecommendationPriority priority;
        try {
            priority = RecommendationPriority.valueOf(priorityStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            priority = RecommendationPriority.MOYENNE;
        }

        List<Recommendation> existingRecommendations = recommendationRepository.findByRiskId(risk.getId());
        Optional<Recommendation> existing = existingRecommendations.stream()
                .filter(rec -> description.equalsIgnoreCase(normalizeText(rec.getDescription())))
                .findFirst();

        if (existing.isPresent()) {
            Recommendation recommendation = existing.get();
            recommendation.setPriority(priority);
            recommendation.setStatus(RecommendationStatus.PROPOSEE);
            recommendationRepository.save(recommendation);
            return;
        }

        recommendationRepository.save(Recommendation.builder()
                .risk(risk)
                .description(description)
                .priority(priority)
                .status(RecommendationStatus.PROPOSEE)
                .build());
    }

    private void saveDefaultRecommendation(Risk risk) {
        String description = "Analyser le risque « " + risk.getTitle() + " » et appliquer une mesure corrective.";
        List<Recommendation> existingRecommendations = recommendationRepository.findByRiskId(risk.getId());
        boolean exists = existingRecommendations.stream()
                .anyMatch(rec -> description.equalsIgnoreCase(normalizeText(rec.getDescription())));
        if (!exists) {
            recommendationRepository.save(Recommendation.builder()
                    .risk(risk)
                    .description(description)
                    .priority(RecommendationPriority.MOYENNE)
                    .status(RecommendationStatus.PROPOSEE)
                    .build());
        }
    }

    private DocumentType mapDocumentType(String value) {
        if (value == null || value.isBlank()) {
            return DocumentType.AUTRE;
        }
        String normalized = value.toUpperCase().replace(" ", "_").replace("-", "_");
        if ("POLITIQUE_SECURITE".equals(normalized)) {
            normalized = "POLITIQUE_SSI";
        }
        if ("RH".equals(normalized) || "DOSSIER_RH".equals(normalized)) {
            return DocumentType.DOSSIER_RH;
        }
        if ("FINANCIER".equals(normalized) || "FACTURE".equals(normalized)) {
            return DocumentType.FACTURE;
        }
        if ("TECHNIQUE".equals(normalized) || "JURIDIQUE".equals(normalized) || "COMPTABLE".equals(normalized) || "COMMERCIAL".equals(normalized)) {
            return DocumentType.PROCEDURE;
        }
        if ("RAPPORT".equals(normalized)) {
            return DocumentType.RAPPORT;
        }
        try {
            return DocumentType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return DocumentType.AUTRE;
        }
    }

    private ConfidentialityLevel mapConfidentiality(String value) {
        if (value == null || value.isBlank()) {
            return ConfidentialityLevel.INTERNE;
        }
        String normalized = value.toUpperCase().trim();
        if ("NON_CLASSIFIE".equals(normalized) || "NONE".equals(normalized)) {
            return ConfidentialityLevel.INTERNE;
        }
        if ("TRES_CONFIDENTIEL".equals(normalized) || "TRÈS_CONFIDENTIEL".equals(normalized)) {
            return ConfidentialityLevel.TRES_CONFIDENTIEL;
        }
        if ("SECRET".equals(normalized) || "SECRETS".equals(normalized)) {
            return ConfidentialityLevel.TRES_CONFIDENTIEL;
        }
        try {
            return ConfidentialityLevel.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return ConfidentialityLevel.INTERNE;
        }
    }

    private String getString(Map<String, Object> map, String snakeKey, String camelKey) {
        Object val = map.get(snakeKey);
        if (val == null && camelKey != null) {
            val = map.get(camelKey);
        }
        return val != null ? val.toString() : "";
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }

    private RiskResponse toRiskResponse(Risk risk) {
        return RiskResponse.builder()
                .id(risk.getId())
                .documentId(risk.getDocument() != null ? risk.getDocument().getId() : null)
                .title(risk.getTitle())
                .description(risk.getDescription())
                .severity(risk.getSeverity())
                .category(risk.getCategory())
                .status(risk.getStatus())
                .detectedAt(risk.getDetectedAt())
                .build();
    }
}
