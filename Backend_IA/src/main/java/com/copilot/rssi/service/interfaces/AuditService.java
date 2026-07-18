package com.copilot.rssi.service.interfaces;

public interface AuditService {
    void log(Long userId, String action, String entityType, Long entityId, String details);
    void log(String username, String action, String entityType, Long entityId, String details);
}
