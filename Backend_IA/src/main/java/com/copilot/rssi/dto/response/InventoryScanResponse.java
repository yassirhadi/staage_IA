package com.copilot.rssi.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InventoryScanResponse {
    private int filesScanned;
    private int filesCreated;
    private int filesUpdated;
    private List<DocumentResponse> documents;
}
