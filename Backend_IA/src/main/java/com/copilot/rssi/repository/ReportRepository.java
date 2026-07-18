package com.copilot.rssi.repository;

import com.copilot.rssi.entity.Report;
import com.copilot.rssi.entity.enums.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReportType(ReportType reportType);
}
