package com.copilot.rssi.entity;

import com.copilot.rssi.entity.enums.AnalysisStatus;
import com.copilot.rssi.entity.enums.AssetStatus;
import com.copilot.rssi.entity.enums.AssetType;
import com.copilot.rssi.entity.enums.ConfidentialityLevel;
import com.copilot.rssi.entity.enums.Criticality;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType assetType;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String owner;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Criticality criticality = Criticality.MOYENNE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AssetStatus status = AssetStatus.ACTIF;

    private BigDecimal value;

    @Column(name = "creation_date")
    private LocalDate creationDate;

    private String location;

    private String responsible;

    private String state;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AnalysisStatus analysisStatus = AnalysisStatus.PENDING;

    @Convert(converter = ConfidentialityLevelConverter.class)
    @Builder.Default
    private ConfidentialityLevel confidentialityLevel = ConfidentialityLevel.INTERNE;

    private String extension;

    private String path;

    private Long size;

    @Column(name = "folder_id", insertable = false, updatable = false)
    private Long folderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    @JsonIgnore
    private Folder folder;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}