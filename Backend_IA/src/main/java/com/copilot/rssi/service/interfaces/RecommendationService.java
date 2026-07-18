package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.request.UpdateRecommendationRequest;
import com.copilot.rssi.dto.response.RecommendationResponse;

import java.util.List;

public interface RecommendationService {
    List<RecommendationResponse> getAll();
    RecommendationResponse updateStatus(Long id, UpdateRecommendationRequest request, String username);
}
