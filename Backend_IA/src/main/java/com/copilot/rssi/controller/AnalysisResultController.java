package com.copilot.rssi.controller;

import com.copilot.rssi.dto.response.AnalysisResultResponse;
import com.copilot.rssi.dto.response.ApiResponse;
import com.copilot.rssi.entity.AnalysisResult;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.service.interfaces.AnalysisResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/analysis-results")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalysisResultController {

    private final AnalysisResultService analysisResultService;
    private final EntityMapper entityMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnalysisResultResponse>>> getAllResults() {
        List<AnalysisResultResponse> results = analysisResultService.getAllResults().stream()
                .map(entityMapper::toAnalysisResultResponse)
                .toList();
        return ResponseEntity.ok(new ApiResponse<>(true, "Analysis results retrieved successfully", results));
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<ApiResponse<AnalysisResultResponse>> getResultByDocumentId(@PathVariable Long documentId) {
        Optional<AnalysisResult> result = analysisResultService.getResultByDocumentId(documentId);
        return result.map(value -> ResponseEntity.ok(new ApiResponse<>(true, "Analysis result retrieved", entityMapper.toAnalysisResultResponse(value))))
                   .orElseGet(() -> ResponseEntity.ok(new ApiResponse<>(false, "No analysis result found", null)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AnalysisResultResponse>> saveResult(@RequestBody AnalysisResult result) {
        AnalysisResult saved = analysisResultService.saveResult(result);
        return ResponseEntity.ok(new ApiResponse<>(true, "Analysis result saved successfully", entityMapper.toAnalysisResultResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResult(@PathVariable Long id) {
        analysisResultService.deleteResult(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Analysis result deleted successfully", null));
    }
}
