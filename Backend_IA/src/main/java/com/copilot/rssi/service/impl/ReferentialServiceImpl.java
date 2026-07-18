package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.response.ReferentialResponse;
import com.copilot.rssi.entity.Referential;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.ReferentialRepository;
import com.copilot.rssi.service.interfaces.ReferentialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReferentialServiceImpl implements ReferentialService {
    private final ReferentialRepository referentialRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ReferentialResponse> getAll() {
        return referentialRepository.findAll().stream().map(mapper::toReferentialResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReferentialResponse> getActive() {
        return referentialRepository.findByActiveTrue().stream().map(mapper::toReferentialResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReferentialResponse getById(Long id) {
        return referentialRepository.findById(id).map(mapper::toReferentialResponse).orElse(null);
    }

    @Override
    @Transactional
    public ReferentialResponse create(Referential referential) {
        return mapper.toReferentialResponse(referentialRepository.save(referential));
    }

    @Override
    @Transactional
    public ReferentialResponse update(Long id, Referential referential) {
        return referentialRepository.findById(id).map(existingReferential -> {
            if (referential.getCode() != null) existingReferential.setCode(referential.getCode());
            if (referential.getName() != null) existingReferential.setName(referential.getName());
            if (referential.getCategory() != null) existingReferential.setCategory(referential.getCategory());
            if (referential.getContent() != null) existingReferential.setContent(referential.getContent());
            if (referential.getSourceUrl() != null) existingReferential.setSourceUrl(referential.getSourceUrl());
            if (referential.getVersion() != null) existingReferential.setVersion(referential.getVersion());
            if (referential.getActive() != null) existingReferential.setActive(referential.getActive());
            if (referential.getObjective() != null) existingReferential.setObjective(referential.getObjective());
            if (referential.getControls() != null) existingReferential.setControls(referential.getControls());
            if (referential.getComplianceScore() != null) existingReferential.setComplianceScore(referential.getComplianceScore());
            return mapper.toReferentialResponse(referentialRepository.save(existingReferential));
        }).orElse(null);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        referentialRepository.deleteById(id);
    }
}