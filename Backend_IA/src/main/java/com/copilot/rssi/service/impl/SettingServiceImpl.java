package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.response.SettingResponse;
import com.copilot.rssi.entity.Setting;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.SettingRepository;
import com.copilot.rssi.service.interfaces.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingServiceImpl implements SettingService {
    private final SettingRepository settingRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public SettingResponse getSettings() {
        return mapper.toSettingResponse(settingRepository.getOrCreateDefault());
    }

    @Override
    @Transactional
    public SettingResponse updateSettings(Setting updatedSettings) {
        Setting currentSettings = settingRepository.getOrCreateDefault();
        if (updatedSettings.getCompanyName() != null) currentSettings.setCompanyName(updatedSettings.getCompanyName());
        if (updatedSettings.getLogoUrl() != null) currentSettings.setLogoUrl(updatedSettings.getLogoUrl());
        if (updatedSettings.getLanguage() != null) currentSettings.setLanguage(updatedSettings.getLanguage());
        if (updatedSettings.getTimezone() != null) currentSettings.setTimezone(updatedSettings.getTimezone());
        if (updatedSettings.getEmail() != null) currentSettings.setEmail(updatedSettings.getEmail());
        if (updatedSettings.getStoragePath() != null) currentSettings.setStoragePath(updatedSettings.getStoragePath());
        if (updatedSettings.getOcrEnabled() != null) currentSettings.setOcrEnabled(updatedSettings.getOcrEnabled());
        return mapper.toSettingResponse(settingRepository.save(currentSettings));
    }
}
