package com.copilot.rssi.dto.response;

import com.copilot.rssi.entity.enums.RoleName;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String type;
    private Long userId;
    private String username;
    private String email;
    private RoleName role;
}
