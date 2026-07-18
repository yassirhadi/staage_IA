package com.copilot.rssi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FolderResponse {
    private Long id;
    private String name;
    private String path;
    private Long parentId;
    private LocalDateTime scannedAt;
}
