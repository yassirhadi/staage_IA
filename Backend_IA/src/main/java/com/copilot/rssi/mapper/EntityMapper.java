package com.copilot.rssi.mapper;

import com.copilot.rssi.entity.*;
import com.copilot.rssi.dto.response.*;
import org.springframework.stereotype.Component;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    // Asset -> AssetResponse
    public AssetResponse toAssetResponse(Asset asset) {
        if (asset == null) return null;
        return AssetResponse.builder()
                .id(asset.getId())
                .name(asset.getName())
                .assetType(asset.getAssetType())
                .description(asset.getDescription())
                .owner(asset.getOwner())
                .criticality(asset.getCriticality())
                .status(asset.getStatus())
                .analysisStatus(asset.getAnalysisStatus())
                .confidentialityLevel(asset.getConfidentialityLevel())
                .extension(asset.getExtension())
                .path(asset.getPath())
                .size(asset.getSize())
                .folderId(asset.getFolderId())
                .value(asset.getValue())
                .creationDate(asset.getCreationDate())
                .location(asset.getLocation())
                .responsible(asset.getResponsible())
                .state(asset.getState())
                .createdAt(asset.getCreatedAt())
                .build();
    }

    // Folder -> FolderResponse
    public FolderResponse toFolderResponse(Folder folder) {
        if (folder == null) return null;
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .path(folder.getPath())
                .scannedAt(folder.getScannedAt() != null ? folder.getScannedAt() : folder.getCreatedAt())
                .build();
    }

    // Report -> ReportResponse
    public ReportResponse toReportResponse(Report report) {
        if (report == null) return null;
        return ReportResponse.builder()
                .id(report.getId())
                .title(report.getTitle())
                .reportType(report.getReportType())
                .content(report.getContent())
                .generatedBy(report.getGeneratedBy() != null ? report.getGeneratedBy().getUsername() : null)
                .generatedAt(report.getGeneratedAt())
                .build();
    }

    // User -> UserResponse
    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    // Recommendation -> RecommendationResponse
    public RecommendationResponse toRecommendationResponse(Recommendation recommendation) {
        if (recommendation == null) return null;
        return RecommendationResponse.builder()
                .id(recommendation.getId())
                .riskId(recommendation.getRisk() != null ? recommendation.getRisk().getId() : null)
                .riskTitle(recommendation.getRisk() != null ? recommendation.getRisk().getTitle() : null)
                .description(recommendation.getDescription())
                .priority(recommendation.getPriority())
                .status(recommendation.getStatus())
                .createdAt(recommendation.getCreatedAt())
                .build();
    }

    // Referential -> ReferentialResponse
    public ReferentialResponse toReferentialResponse(Referential referential) {
        if (referential == null) return null;
        return ReferentialResponse.builder()
                .id(referential.getId())
                .code(referential.getCode())
                .name(referential.getName())
                .category(referential.getCategory())
                .content(referential.getContent())
                .version(referential.getVersion())
                .active(referential.getActive())
                .createdAt(referential.getCreatedAt())
                .build();
    }

    // AuditLog -> AuditLogResponse
    public AuditLogResponse toAuditLogResponse(AuditLog auditLog) {
        if (auditLog == null) return null;
        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .username(auditLog.getUser() != null ? auditLog.getUser().getUsername() : null)
                .action(auditLog.getAction())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .details(auditLog.getDetails())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }

    // Document -> DocumentResponse
    public DocumentResponse toDocumentResponse(Document document) {
        if (document == null) return null;
        return DocumentResponse.builder()
                .id(document.getId())
                .fileName(document.getFileName())
                .filePath(document.getFilePath())
                .extension(document.getExtension())
                .fileSize(document.getFileSize())
                .mimeType(document.getMimeType())
                .createdDate(document.getCreatedDate())
                .modifiedDate(document.getModifiedDate())
                .permissions(document.getPermissions())
                .documentType(document.getDocumentType())
                .confidentialityLevel(document.getConfidentialityLevel())
                .analysisStatus(document.getAnalysisStatus())
                .createdAt(document.getCreatedAt())
                .build();
    }

    public AnalysisResultResponse toAnalysisResultResponse(AnalysisResult analysisResult) {
        if (analysisResult == null) return null;
        return AnalysisResultResponse.builder()
                .id(analysisResult.getId())
                .documentId(analysisResult.getDocumentId())
                .documentType(analysisResult.getDocumentType())
                .confidentialityLevel(analysisResult.getConfidentialityLevel())
                .piiDetected(analysisResult.getPiiDetected())
                .risksCount(analysisResult.getRisksCount())
                .complianceStandards(analysisResult.getComplianceStandards())
                .securityScore(analysisResult.getSecurityScore())
                .detectedDataTypes(analysisResult.getDetectedDataTypes())
                .risksDetails(analysisResult.getRisksDetails())
                .createdAt(analysisResult.getCreatedAt())
                .build();
    }

    // Permission -> PermissionResponse
    public PermissionResponse toPermissionResponse(Permission permission) {
        if (permission == null) return null;
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .createdAt(permission.getCreatedAt())
                .build();
    }

    // Role -> RoleResponse
    public RoleResponse toRoleResponse(Role role) {
        if (role == null) return null;
        Set<PermissionResponse> permissions = role.getPermissions() != null ?
                role.getPermissions().stream().map(this::toPermissionResponse).collect(Collectors.toSet()) :
                Set.of();
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .permissions(permissions)
                .createdAt(role.getCreatedAt())
                .build();
    }

    // Setting -> SettingResponse
    public SettingResponse toSettingResponse(Setting setting) {
        if (setting == null) return null;
        return SettingResponse.builder()
                .id(setting.getId())
                .companyName(setting.getCompanyName())
                .logoUrl(setting.getLogoUrl())
                .language(setting.getLanguage())
                .timezone(setting.getTimezone())
                .email(setting.getEmail())
                .storagePath(setting.getStoragePath())
                .ocrEnabled(setting.getOcrEnabled())
                .createdAt(setting.getCreatedAt())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}