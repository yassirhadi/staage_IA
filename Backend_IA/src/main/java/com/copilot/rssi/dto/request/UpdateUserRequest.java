package com.copilot.rssi.dto.request;

import com.copilot.rssi.entity.enums.RoleName;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Email
    private String email;
    private String firstName;
    private String lastName;
    private RoleName role;
    private Boolean enabled;
}
