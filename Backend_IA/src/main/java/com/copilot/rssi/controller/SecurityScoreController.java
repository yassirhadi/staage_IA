package com.copilot.rssi.controller;

import com.copilot.rssi.dto.response.ApiResponse;
import com.copilot.rssi.entity.SecurityScore;
import com.copilot.rssi.service.interfaces.SecurityScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/security-scores")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SecurityScoreController {

    private final SecurityScoreService securityScoreService;

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<SecurityScore>> getLatestScore() {
        Optional<SecurityScore> score = securityScoreService.getLatestScore();
        return score.map(value -> ResponseEntity.ok(new ApiResponse<>(true, "Latest security score retrieved", value)))
                   .orElseGet(() -> ResponseEntity.ok(new ApiResponse<>(false, "No security score found", null)));
    }

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<SecurityScore>> calculateScore() {
        SecurityScore score = securityScoreService.calculateAndSaveScore();
        return ResponseEntity.ok(new ApiResponse<>(true, "Security score calculated and saved", score));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SecurityScore>> saveScore(@RequestBody SecurityScore score) {
        SecurityScore saved = securityScoreService.saveScore(score);
        return ResponseEntity.ok(new ApiResponse<>(true, "Security score saved successfully", saved));
    }
}
