package com.copilot.rssi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "referentials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Referential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(length = 50)
    private String version;

    @Builder.Default
    private Boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String objective;

    @Column(columnDefinition = "TEXT")
    private String controls;

    @Column(name = "compliance_score")
    @Builder.Default
    private Integer complianceScore = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
