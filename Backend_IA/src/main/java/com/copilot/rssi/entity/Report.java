package com.copilot.rssi.entity;

import com.copilot.rssi.entity.enums.ReportType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(name = "rssi_signature", length = 255)
    private String rssiSignature;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(name = "generated_by", insertable = false, updatable = false)
    private Long generatedById;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "generated_by")
    @JsonIgnore
    private User generatedBy;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
