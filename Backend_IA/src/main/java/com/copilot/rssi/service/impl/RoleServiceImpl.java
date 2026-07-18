package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.response.RoleResponse;
import com.copilot.rssi.entity.Role;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.RoleRepository;
import com.copilot.rssi.service.interfaces.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final EntityMapper entityMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream().map(entityMapper::toRoleResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getById(Long id) {
        return roleRepository.findById(id).map(entityMapper::toRoleResponse).orElse(null);
    }

    @Override
    @Transactional
    public RoleResponse create(Role role) {
        return entityMapper.toRoleResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public RoleResponse update(Long id, Role roleDetails) {
        return roleRepository.findById(id).map(role -> {
            if (roleDetails.getName() != null) role.setName(roleDetails.getName());
            if (roleDetails.getDescription() != null) role.setDescription(roleDetails.getDescription());
            if (roleDetails.getPermissions() != null) role.setPermissions(roleDetails.getPermissions());
            return entityMapper.toRoleResponse(roleRepository.save(role));
        }).orElse(null);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        roleRepository.deleteById(id);
    }
}
