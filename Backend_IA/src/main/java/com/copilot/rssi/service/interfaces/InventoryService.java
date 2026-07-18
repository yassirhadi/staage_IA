package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.response.DocumentResponse;
import com.copilot.rssi.dto.response.InventoryScanResponse;

import java.util.List;

public interface InventoryService {
    InventoryScanResponse scanFolder(String folderPath);
    List<DocumentResponse> getAllDocuments();
    DocumentResponse analyzeDocument(Long documentId);
    void deleteDocument(Long documentId);
}
