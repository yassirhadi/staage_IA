package com.copilot.rssi.entity;

import com.copilot.rssi.entity.enums.RecommendationPriority;
import com.copilot.rssi.entity.enums.RecommendationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "risk_id", nullable = false, insertable = false, updatable = false)
    private Long riskId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "risk_id", nullable = false)
    @JsonIgnore
    private Risk risk;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecommendationPriority priority = RecommendationPriority.MOYENNE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecommendationStatus status = RecommendationStatus.PROPOSEE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Builder.Default
    private Integer progress = 0;

    @Column(name = "rssi_comment", columnDefinition = "TEXT")
    private String rssiComment;

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
