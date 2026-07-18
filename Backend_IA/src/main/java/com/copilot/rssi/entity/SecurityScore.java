package com.copilot.rssi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "documents_score")
    private Integer documentsScore;

    @Column(name = "risks_score")
    private Integer risksScore;

    @Column(name = "compliance_score")
    private Integer complianceScore;

    @Column(name = "recommendations_score")
    private Integer recommendationsScore;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
    }
}
