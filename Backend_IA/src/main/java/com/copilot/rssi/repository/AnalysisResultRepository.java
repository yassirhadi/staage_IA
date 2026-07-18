package com.copilot.rssi.repository;

import com.copilot.rssi.entity.AnalysisResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    
    Optional<AnalysisResult> findByDocumentId(Long documentId);
    
    List<AnalysisResult> findByDocumentIdOrderByCreatedAtDesc(Long documentId);

    void deleteByDocumentId(Long documentId);
}
