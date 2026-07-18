package com.copilot.rssi.service.impl;

import com.copilot.rssi.entity.AuditLog;
import com.copilot.rssi.entity.User;
import com.copilot.rssi.repository.AuditLogRepository;
import com.copilot.rssi.repository.UserRepository;
import com.copilot.rssi.service.interfaces.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void log(Long userId, String action, String entityType, Long entityId, String details) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        auditLogRepository.save(AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build());
    }

    @Override
    @Transactional
    public void log(String username, String action, String entityType, Long entityId, String details) {
        User user = userRepository.findByUsername(username).orElse(null);
        log(user != null ? user.getId() : null, action, entityType, entityId, details);
    }
}
