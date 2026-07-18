package com.copilot.rssi.repository;

import com.copilot.rssi.entity.CopilotHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CopilotHistoryRepository extends JpaRepository<CopilotHistory, Long> {
    
    List<CopilotHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<CopilotHistory> findAllByOrderByCreatedAtDesc();
}
