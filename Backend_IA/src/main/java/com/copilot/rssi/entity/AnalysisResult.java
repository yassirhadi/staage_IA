package com.copilot.rssi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id", nullable = false, insertable = false, updatable = false)
    private Long documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "document_type", length = 100)
    private String documentType;

    @Column(name = "confidentiality_level", length = 50)
    private String confidentialityLevel;

    @Column(name = "pii_detected")
    private Boolean piiDetected;

    @Column(name = "risks_count")
    private Integer risksCount;

    @Column(name = "compliance_standards", columnDefinition = "TEXT")
    private String complianceStandards;

    @Column(name = "security_score")
    private Integer securityScore;

    @Column(name = "detected_data_types", columnDefinition = "TEXT")
    private String detectedDataTypes;

    @Column(name = "risks_details", columnDefinition = "TEXT")
    private String risksDetails;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
