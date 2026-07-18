package com.copilot.rssi.entity;

import com.copilot.rssi.entity.enums.ConfidentialityLevel;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ConfidentialityLevelConverter implements AttributeConverter<ConfidentialityLevel, String> {

@Override
    public String convertToDatabaseColumn(ConfidentialityLevel attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public ConfidentialityLevel convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        String normalized = dbData.trim().toUpperCase();
        if ("SECRET".equals(normalized) || "TRÈS_CONFIDENTIEL".equals(normalized) || "TRES_CONFIDENTIEL".equals(normalized)) {
            return ConfidentialityLevel.TRES_CONFIDENTIEL;
        }
        return ConfidentialityLevel.valueOf(normalized);
    }
}
