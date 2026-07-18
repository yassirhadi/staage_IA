package com.copilot.rssi.repository;

import com.copilot.rssi.entity.Risk;
import com.copilot.rssi.entity.enums.RiskSeverity;
import com.copilot.rssi.entity.enums.RiskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiskRepository extends JpaRepository<Risk, Long> {
    List<Risk> findBySeverity(RiskSeverity severity);
    List<Risk> findByStatus(RiskStatus status);
    List<Risk> findByDocumentId(Long documentId);
    void deleteByDocumentId(Long documentId);
}
