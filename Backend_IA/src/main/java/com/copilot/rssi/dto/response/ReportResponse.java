package com.copilot.rssi.dto.response;

import com.copilot.rssi.entity.enums.ReportType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private String title;
    private ReportType reportType;
    private String content;
    private String generatedBy;
    private LocalDateTime generatedAt;
}
