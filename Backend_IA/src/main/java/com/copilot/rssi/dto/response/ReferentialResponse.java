package com.copilot.rssi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReferentialResponse {
    private Long id;
    private String code;
    private String name;
    private String category;
    private String content;
    private String version;
    private Boolean active;
    private LocalDateTime createdAt;
}
