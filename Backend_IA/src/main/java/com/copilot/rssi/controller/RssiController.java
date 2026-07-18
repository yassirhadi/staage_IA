package com.copilot.rssi.controller;

import com.copilot.rssi.dto.request.GenerateReportRequest;
import com.copilot.rssi.dto.request.UpdateRecommendationRequest;
import com.copilot.rssi.dto.response.*;
import com.copilot.rssi.entity.Document;
import com.copilot.rssi.repository.DocumentRepository;
import com.copilot.rssi.service.interfaces.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/rssi")
@RequiredArgsConstructor
@Tag(name = "RSSI - Gouvernance")
public class RssiController {

    private final RecommendationService recommendationService;
    private final ReportService reportService;
    private final ReferentialService referentialService;
    private final FolderService folderService;
    private final AuditLogService auditLogService;
    private final DocumentRepository documentRepository;

    @GetMapping("/recommendations")
    @Operation(summary = "Lister les recommandations IA")
    public ApiResponse<List<RecommendationResponse>> getRecommendations() {
        return ApiResponse.ok(recommendationService.getAll());
    }

    @PutMapping("/recommendations/{id}/status")
    @Operation(summary = "Valider ou rejeter une recommandation")
    public ApiResponse<RecommendationResponse> updateRecommendation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecommendationRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ApiResponse.ok(recommendationService.updateStatus(id, request, user.getUsername()));
    }

    @PostMapping("/reports/generate")
    @Operation(summary = "Générer un rapport")
    public ApiResponse<ReportResponse> generateReport(
            @Valid @RequestBody GenerateReportRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ApiResponse.ok(reportService.generate(request, user.getUsername()));
    }

    @GetMapping("/reports")
    @Operation(summary = "Lister les rapports")
    public ApiResponse<List<ReportResponse>> getReports() {
        return ApiResponse.ok(reportService.getAll());
    }

    @GetMapping("/reports/{id}")
    @Operation(summary = "Consulter un rapport")
    public ApiResponse<ReportResponse> getReport(@PathVariable Long id) {
        return ApiResponse.ok(reportService.getById(id));
    }

    @GetMapping("/reports/export/excel")
    @Operation(summary = "Exporter l'inventaire en Excel")
    public ResponseEntity<byte[]> exportExcelReport() throws IOException {
        List<Document> documents = documentRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Inventaire RSSI");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Fichier", "Extension", "Taille", "Type", "Confidentialité", "Statut"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Document doc : documents) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(doc.getId() != null ? doc.getId() : 0);
                row.createCell(1).setCellValue(doc.getFileName() != null ? doc.getFileName() : "");
                row.createCell(2).setCellValue(doc.getExtension() != null ? doc.getExtension() : "");
                row.createCell(3).setCellValue(doc.getFileSize() != null ? doc.getFileSize() : 0);
                row.createCell(4).setCellValue(doc.getDocumentType() != null ? doc.getDocumentType().name() : "");
                row.createCell(5).setCellValue(doc.getConfidentialityLevel() != null ? doc.getConfidentialityLevel().name() : "NON_CLASSIFIE");
                row.createCell(6).setCellValue(doc.getAnalysisStatus() != null ? doc.getAnalysisStatus().name() : "PENDING");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Rapport_Inventaire_RSSI.xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(out.toByteArray());
        }
    }

    @GetMapping("/referentials")
    @Operation(summary = "Consulter les référentiels actifs")
    public ApiResponse<List<ReferentialResponse>> getReferentials() {
        return ApiResponse.ok(referentialService.getActive());
    }

    @GetMapping("/folders")
    @Operation(summary = "Lister les dossiers inventoriés")
    public ApiResponse<List<FolderResponse>> getFolders() {
        return ApiResponse.ok(folderService.getAll());
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Consulter les logs de sécurité")
    public ApiResponse<List<AuditLogResponse>> getAuditLogs() {
        return ApiResponse.ok(auditLogService.getAll());
    }
}
