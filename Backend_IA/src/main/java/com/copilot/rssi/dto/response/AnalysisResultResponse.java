package com.copilot.rssi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResultResponse {
    private Long id;
    private Long documentId;
    private String documentType;
    private String confidentialityLevel;
    private Boolean piiDetected;
    private Integer risksCount;
    private String complianceStandards;
    private Integer securityScore;
    private String detectedDataTypes;
    private String risksDetails;
    private LocalDateTime createdAt;
}
