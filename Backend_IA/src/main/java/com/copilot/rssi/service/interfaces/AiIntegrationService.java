package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.request.ChatRequest;
import com.copilot.rssi.dto.response.RiskResponse;

import java.util.List;
import java.util.Map;

public interface AiIntegrationService {
    Map<String, Object> analyzeDocument(Long documentId, String filePath);
    Map<String, Object> chat(ChatRequest request);
    List<RiskResponse> getAllRisks();
}
