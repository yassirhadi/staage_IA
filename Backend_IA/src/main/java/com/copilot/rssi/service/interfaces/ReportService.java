package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.request.GenerateReportRequest;
import com.copilot.rssi.dto.response.ReportResponse;

import java.util.List;

public interface ReportService {
    ReportResponse generate(GenerateReportRequest request, String username);
    List<ReportResponse> getAll();
    ReportResponse getById(Long id);
}
