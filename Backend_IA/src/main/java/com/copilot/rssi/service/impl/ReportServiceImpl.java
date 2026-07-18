package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.request.GenerateReportRequest;
import com.copilot.rssi.dto.response.ReportResponse;
import com.copilot.rssi.entity.Report;
import com.copilot.rssi.entity.User;
import com.copilot.rssi.entity.Document;
import com.copilot.rssi.entity.enums.ReportType;
import com.copilot.rssi.exception.ResourceNotFoundException;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.*;
import com.copilot.rssi.service.interfaces.AuditService;
import com.copilot.rssi.service.interfaces.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final DocumentRepository documentRepository;
    private final RiskRepository riskRepository;
    private final AssetRepository assetRepository;
    private final SensitiveDataRepository sensitiveDataRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;
    private final AuditService auditService;

    @Override
    @Transactional
    public ReportResponse generate(GenerateReportRequest request, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        String content = buildReportContent(request.getReportType());
        String title = "Rapport " + request.getReportType().name() + " - "
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        Report report = Report.builder()
                .title(title)
                .reportType(request.getReportType())
                .content(content)
                .generatedBy(user)
                .build();

        Report saved = reportRepository.save(report);
        auditService.log(username, "GENERATE_REPORT", "Report", saved.getId(), title);
        return mapper.toReportResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportResponse> getAll() {
        return reportRepository.findAll().stream().map(mapper::toReportResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getById(Long id) {
        return mapper.toReportResponse(reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rapport non trouvé")));
    }

    private String buildReportContent(ReportType type) {
        return switch (type) {
            case INVENTAIRE -> buildInventoryReport();
            case RISQUES -> buildRiskReport();
            case CONFORMITE -> buildComplianceReport();
            case CLASSIFICATION -> buildClassificationReport();
        };
    }

    private String buildInventoryReport() {
        long docs = documentRepository.count();
        long assets = assetRepository.count();
        String docList = documentRepository.findAll().stream()
                .map(this::formatDocumentLine)
                .collect(Collectors.joining("\n"));
        return """
                RAPPORT D'INVENTAIRE
                ====================
                Documents: %d
                Actifs: %d
                
                Liste des documents:
                %s
                """.formatted(docs, assets, docList.isBlank() ? "Aucun document disponible" : docList);
    }

    private String buildRiskReport() {
        String risks = riskRepository.findAll().stream()
                .map(this::formatRiskLine)
                .collect(Collectors.joining("\n"));
        return """
                RAPPORT DES RISQUES
                ===================
                Total risques: %d
                
                %s
                """.formatted(riskRepository.count(), risks.isBlank() ? "Aucun risque détecté" : risks);
    }

    private String buildComplianceReport() {
        long sensitive = sensitiveDataRepository.count();
        long risks = riskRepository.count();
        return """
                RAPPORT DE CONFORMITE
                =====================
                Donnees sensibles detectees: %d
                Risques ouverts: %d
                Referentiels: ISO 27001, NIST, CIS
                
                Recommandation: Valider les mesures correctives pour chaque risque ELEVE ou CRITIQUE.
                """.formatted(sensitive, risks);
    }

    private String buildClassificationReport() {
        String docs = documentRepository.findAll().stream()
                .map(this::formatClassificationLine)
                .collect(Collectors.joining("\n"));
        return """
                RAPPORT DE CLASSIFICATION
                =========================
                %s
                """.formatted(docs.isBlank() ? "Aucune classification disponible" : docs);
    }

    private String formatDocumentLine(Document document) {
        String type = Optional.ofNullable(document.getDocumentType()).map(Enum::name).orElse("Non défini");
        return "- " + safe(document.getFileName()) + " (" + type + ")";
    }

    private String formatRiskLine(com.copilot.rssi.entity.Risk risk) {
        String severity = Optional.ofNullable(risk.getSeverity()).map(Enum::name).orElse("NON DEFINI");
        return "- [" + severity + "] " + safe(risk.getTitle()) + ": " + safe(risk.getDescription());
    }

    private String formatClassificationLine(Document document) {
        String level = Optional.ofNullable(document.getConfidentialityLevel()).map(Enum::name).orElse("NON DEFINI");
        return "- " + safe(document.getFileName()) + " => " + level;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Non disponible" : value;
    }
}
