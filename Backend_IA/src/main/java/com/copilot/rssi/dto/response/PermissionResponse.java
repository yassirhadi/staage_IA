package com.copilot.rssi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PermissionResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
