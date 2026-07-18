package com.copilot.rssi.dto.response;

import com.copilot.rssi.entity.enums.RiskSeverity;
import com.copilot.rssi.entity.enums.RiskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RiskResponse {
    private Long id;
    private Long documentId;
    private String title;
    private String description;
    private RiskSeverity severity;
    private String category;
    private RiskStatus status;
    private LocalDateTime detectedAt;
}
