package com.copilot.rssi.service.impl;

import com.copilot.rssi.entity.CopilotHistory;
import com.copilot.rssi.repository.CopilotHistoryRepository;
import com.copilot.rssi.service.interfaces.CopilotHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CopilotHistoryServiceImpl implements CopilotHistoryService {

    private final CopilotHistoryRepository copilotHistoryRepository;

    @Override
    public List<CopilotHistory> getAllHistory() {
        return copilotHistoryRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<CopilotHistory> getUserHistory(Long userId) {
        return copilotHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public CopilotHistory saveHistory(CopilotHistory history) {
        return copilotHistoryRepository.save(history);
    }

    @Override
    public void deleteHistory(Long id) {
        copilotHistoryRepository.deleteById(id);
    }
}
