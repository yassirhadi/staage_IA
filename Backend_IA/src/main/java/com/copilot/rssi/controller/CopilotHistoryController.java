package com.copilot.rssi.controller;

import com.copilot.rssi.dto.response.ApiResponse;
import com.copilot.rssi.entity.CopilotHistory;
import com.copilot.rssi.service.interfaces.CopilotHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/copilot-history")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CopilotHistoryController {

    private final CopilotHistoryService copilotHistoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CopilotHistory>>> getAllHistory() {
        List<CopilotHistory> history = copilotHistoryService.getAllHistory();
        return ResponseEntity.ok(new ApiResponse<>(true, "Copilot history retrieved successfully", history));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<CopilotHistory>>> getUserHistory(@PathVariable Long userId) {
        List<CopilotHistory> history = copilotHistoryService.getUserHistory(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User copilot history retrieved successfully", history));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CopilotHistory>> saveHistory(@RequestBody CopilotHistory history) {
        CopilotHistory saved = copilotHistoryService.saveHistory(history);
        return ResponseEntity.ok(new ApiResponse<>(true, "Copilot history saved successfully", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHistory(@PathVariable Long id) {
        copilotHistoryService.deleteHistory(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Copilot history deleted successfully", null));
    }
}
