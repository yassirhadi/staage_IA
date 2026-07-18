package com.copilot.rssi.entity;

import com.copilot.rssi.entity.enums.SensitiveDataType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensitive_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensitiveData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    private SensitiveDataType dataType;

    @Column(name = "detected_value", length = 500)
    private String detectedValue;

    @Column(name = "masked_value", length = 500)
    private String maskedValue;

    @Column(precision = 5, scale = 4)
    private BigDecimal confidence;

    @Column(name = "position_start")
    private Integer positionStart;

    @Column(name = "position_end")
    private Integer positionEnd;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
