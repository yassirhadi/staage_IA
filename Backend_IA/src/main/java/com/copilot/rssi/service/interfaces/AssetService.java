package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.request.AssetRequest;
import com.copilot.rssi.dto.response.AssetResponse;

import java.util.List;

public interface AssetService {
    AssetResponse create(AssetRequest request);
    AssetResponse getById(Long id);
    List<AssetResponse> getAll();
    AssetResponse update(Long id, AssetRequest request);
    void delete(Long id);
}
