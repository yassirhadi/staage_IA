package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.response.RoleResponse;
import com.copilot.rssi.entity.Role;

import java.util.List;

public interface RoleService {
    List<RoleResponse> getAll();
    RoleResponse getById(Long id);
    RoleResponse create(Role role);
    RoleResponse update(Long id, Role role);
    void delete(Long id);
}
