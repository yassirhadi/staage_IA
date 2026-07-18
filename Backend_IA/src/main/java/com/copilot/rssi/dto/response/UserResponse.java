package com.copilot.rssi.dto.response;

import com.copilot.rssi.entity.enums.RoleName;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private RoleName role;
    private Boolean enabled;
    private LocalDateTime createdAt;
}
