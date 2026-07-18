package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.response.AuditLogResponse;

import java.util.List;

public interface AuditLogService {
    List<AuditLogResponse> getAll();
}
