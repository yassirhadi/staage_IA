package com.copilot.rssi.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {

    @NotBlank(message = "La question est obligatoire")
    private String question;
}
