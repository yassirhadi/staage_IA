package com.copilot.rssi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Setting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 10)
    @Builder.Default
    private String language = "fr";

    @Column(length = 50)
    @Builder.Default
    private String timezone = "Africa/Casablanca";

    @Column(length = 150)
    private String email;

    @Column(name = "storage_path", length = 500)
    private String storagePath;

    @Column(name = "ocr_enabled")
    @Builder.Default
    private Boolean ocrEnabled = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
