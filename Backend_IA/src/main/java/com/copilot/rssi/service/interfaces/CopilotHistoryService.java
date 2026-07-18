package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.entity.CopilotHistory;

import java.util.List;

public interface CopilotHistoryService {
    
    List<CopilotHistory> getAllHistory();
    
    List<CopilotHistory> getUserHistory(Long userId);
    
    CopilotHistory saveHistory(CopilotHistory history);
    
    void deleteHistory(Long id);
}
