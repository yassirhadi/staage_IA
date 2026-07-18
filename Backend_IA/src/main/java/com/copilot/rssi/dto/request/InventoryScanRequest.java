package com.copilot.rssi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InventoryScanRequest {

    @NotBlank(message = "Le chemin du dossier est obligatoire")
    private String directoryPath;
}
