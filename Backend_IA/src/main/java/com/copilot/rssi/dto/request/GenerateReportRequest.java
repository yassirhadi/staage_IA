package com.copilot.rssi.dto.request;

import com.copilot.rssi.entity.enums.ReportType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GenerateReportRequest {
    @NotNull
    private ReportType reportType;
}
