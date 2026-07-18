package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.response.SettingResponse;

public interface SettingService {
    SettingResponse getSettings();
    SettingResponse updateSettings(com.copilot.rssi.entity.Setting updatedSettings);
}
