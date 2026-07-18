package com.copilot.rssi.dto.response;

import com.copilot.rssi.entity.enums.RoleName;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class RoleResponse {
    private Long id;
    private RoleName name;
    private String description;
    private Set<PermissionResponse> permissions;
    private LocalDateTime createdAt;
}
