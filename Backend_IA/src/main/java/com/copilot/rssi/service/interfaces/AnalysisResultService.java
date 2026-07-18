package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.entity.AnalysisResult;

import java.util.List;
import java.util.Optional;

public interface AnalysisResultService {
    
    List<AnalysisResult> getAllResults();
    
    Optional<AnalysisResult> getResultByDocumentId(Long documentId);
    
    AnalysisResult saveResult(AnalysisResult result);
    
    void deleteResult(Long id);
}
