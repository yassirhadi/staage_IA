package com.copilot.rssi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SettingResponse {
    private Long id;
    private String companyName;
    private String logoUrl;
    private String language;
    private String timezone;
    private String email;
    private String storagePath;
    private Boolean ocrEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
