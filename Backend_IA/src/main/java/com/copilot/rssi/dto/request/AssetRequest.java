package com.copilot.rssi.dto.request;

import com.copilot.rssi.entity.enums.AssetStatus;
import com.copilot.rssi.entity.enums.AssetType;
import com.copilot.rssi.entity.enums.AnalysisStatus;
import com.copilot.rssi.entity.enums.ConfidentialityLevel;
import com.copilot.rssi.entity.enums.Criticality;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AssetRequest {

    @NotBlank(message = "Le nom de l'actif est obligatoire")
    private String name;

    @NotNull(message = "Le type d'actif est obligatoire")
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
}
