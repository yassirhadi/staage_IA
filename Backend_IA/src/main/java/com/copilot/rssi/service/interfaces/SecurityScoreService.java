package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.entity.SecurityScore;

import java.util.Optional;

public interface SecurityScoreService {
    
    Optional<SecurityScore> getLatestScore();
    
    SecurityScore calculateAndSaveScore();
    
    SecurityScore saveScore(SecurityScore score);
}
