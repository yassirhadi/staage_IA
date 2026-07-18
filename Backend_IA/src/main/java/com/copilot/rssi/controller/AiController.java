package com.copilot.rssi.controller;

import com.copilot.rssi.dto.request.ChatRequest;
import com.copilot.rssi.dto.response.ApiResponse;
import com.copilot.rssi.dto.response.RiskResponse;
import com.copilot.rssi.service.interfaces.AiIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "Intelligence Artificielle")
public class AiController {

    private final AiIntegrationService aiIntegrationService;

    @PostMapping("/chat")
    @Operation(summary = "Poser une question au Copilote IA")
    public ApiResponse<Map<String, Object>> chat(@Valid @RequestBody ChatRequest request) {
        return ApiResponse.ok(aiIntegrationService.chat(request));
    }

    @GetMapping("/risks")
    @Operation(summary = "Lister tous les risques détectés")
    public ApiResponse<List<RiskResponse>> getRisks() {
        return ApiResponse.ok(aiIntegrationService.getAllRisks());
    }
}
