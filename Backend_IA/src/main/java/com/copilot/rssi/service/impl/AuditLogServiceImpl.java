package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.response.AuditLogResponse;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.AuditLogRepository;
import com.copilot.rssi.service.interfaces.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAll() {
        return auditLogRepository.findAll().stream().map(mapper::toAuditLogResponse).toList();
    }
}