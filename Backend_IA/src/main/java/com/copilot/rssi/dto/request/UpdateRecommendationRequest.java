package com.copilot.rssi.dto.request;

import com.copilot.rssi.entity.enums.RecommendationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateRecommendationRequest {
    @NotNull
    private RecommendationStatus status;
}
