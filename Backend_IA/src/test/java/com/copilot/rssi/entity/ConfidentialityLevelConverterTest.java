package com.copilot.rssi.entity;

import com.copilot.rssi.entity.enums.ConfidentialityLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ConfidentialityLevelConverterTest {

    private final ConfidentialityLevelConverter converter = new ConfidentialityLevelConverter();

    @Test
    void shouldMapTresConfidentielToSecretForDatabaseStorage() {
        assertEquals("SECRET", converter.convertToDatabaseColumn(ConfidentialityLevel.TRES_CONFIDENTIEL));
    }

    @Test
    void shouldMapSecretBackToTresConfidentiel() {
        assertEquals(ConfidentialityLevel.TRES_CONFIDENTIEL, converter.convertToEntityAttribute("SECRET"));
    }
}
