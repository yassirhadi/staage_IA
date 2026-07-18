package com.copilot.rssi.dto.response;

import com.copilot.rssi.entity.enums.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AssetResponse {
    private Long id;
    private String name;
    private AssetType assetType;
    private String description;
    private String owner;
    private Criticality criticality;
    private AssetStatus status;
    private AnalysisStatus analysisStatus;
    private ConfidentialityLevel confidentialityLevel;
    private String extension;
    private String path;
    private Long size;
    private Long folderId;
    private BigDecimal value;
    private LocalDate creationDate;
    private String location;
    private String responsible;
    private String state;
    private LocalDateTime createdAt;
}
