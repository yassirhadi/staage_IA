package com.copilot.rssi.service.impl;

import com.copilot.rssi.entity.AnalysisResult;
import com.copilot.rssi.repository.AnalysisResultRepository;
import com.copilot.rssi.service.interfaces.AnalysisResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AnalysisResultServiceImpl implements AnalysisResultService {

    private final AnalysisResultRepository analysisResultRepository;

    @Override
    public List<AnalysisResult> getAllResults() {
        return analysisResultRepository.findAll();
    }

    @Override
    public Optional<AnalysisResult> getResultByDocumentId(Long documentId) {
        return analysisResultRepository.findByDocumentId(documentId);
    }

    @Override
    public AnalysisResult saveResult(AnalysisResult result) {
        return analysisResultRepository.save(result);
    }

    @Override
    public void deleteResult(Long id) {
        analysisResultRepository.deleteById(id);
    }
}
