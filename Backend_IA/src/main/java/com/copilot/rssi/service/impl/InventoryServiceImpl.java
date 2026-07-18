package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.response.DocumentResponse;
import com.copilot.rssi.dto.response.InventoryScanResponse;
import com.copilot.rssi.entity.AnalysisResult;
import com.copilot.rssi.entity.Asset;
import com.copilot.rssi.entity.Document;
import com.copilot.rssi.entity.Folder;
import com.copilot.rssi.entity.Recommendation;
import com.copilot.rssi.entity.Risk;
import com.copilot.rssi.entity.SensitiveData;
import com.copilot.rssi.entity.enums.AnalysisStatus;
import com.copilot.rssi.entity.enums.AssetStatus;
import com.copilot.rssi.entity.enums.AssetType;
import com.copilot.rssi.entity.enums.ConfidentialityLevel;
import com.copilot.rssi.entity.enums.Criticality;
import com.copilot.rssi.entity.enums.DocumentType;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.AnalysisResultRepository;
import com.copilot.rssi.repository.AssetRepository;
import com.copilot.rssi.repository.DocumentRepository;
import com.copilot.rssi.repository.FolderRepository;
import com.copilot.rssi.repository.RecommendationRepository;
import com.copilot.rssi.repository.RiskRepository;
import com.copilot.rssi.repository.SensitiveDataRepository;
import com.copilot.rssi.service.interfaces.AuditService;
import com.copilot.rssi.service.interfaces.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;
    private final AssetRepository assetRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final SensitiveDataRepository sensitiveDataRepository;
    private final RiskRepository riskRepository;
    private final RecommendationRepository recommendationRepository;
    private final AiIntegrationServiceImpl aiIntegrationService;
    private final EntityMapper entityMapper;
    private final AuditService auditService;

    @Override
    @Transactional
    public InventoryScanResponse scanFolder(String folderPath) {
        File rootFolder = new File(folderPath);
        if (!rootFolder.exists() || !rootFolder.isDirectory()) {
            throw new IllegalArgumentException("Le chemin spécifié est invalide ou n'est pas un dossier.");
        }

        Folder folderEntity = folderRepository.findFirstByPathOrderByIdDesc(rootFolder.getAbsolutePath())
                .orElseGet(() -> {
                    Folder folder = new Folder();
                    folder.setName(rootFolder.getName());
                    folder.setPath(rootFolder.getAbsolutePath());
                    return folderRepository.save(folder);
                });

        int filesCreated = 0;
        int filesUpdated = 0;
        List<Document> scannedDocuments = new ArrayList<>();

        ScanStats stats = new ScanStats();
        collectFiles(rootFolder, folderEntity, scannedDocuments, stats);

        for (Document document : scannedDocuments) {
            aiIntegrationService.analyzeAndPersist(document);
        }

        folderEntity.setScannedAt(LocalDateTime.now());
        folderRepository.save(folderEntity);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        auditService.log(username, "SCAN_FOLDER", "Folder", folderEntity.getId(),
                "Scan de " + folderPath + " — " + scannedDocuments.size() + " fichier(s)");

        List<DocumentResponse> responses = scannedDocuments.stream()
                .map(entityMapper::toDocumentResponse)
                .toList();

        return InventoryScanResponse.builder()
                .filesScanned(scannedDocuments.size())
                .filesCreated(stats.created)
                .filesUpdated(stats.updated)
                .documents(responses)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(entityMapper::toDocumentResponse)
                .toList();
    }

    @Override
    @Transactional
    public DocumentResponse analyzeDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable: " + documentId));
        aiIntegrationService.analyzeAndPersist(document);
        return entityMapper.toDocumentResponse(documentRepository.findById(documentId).orElse(document));
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable: " + documentId));

        analysisResultRepository.deleteByDocumentId(documentId);

        List<SensitiveData> sensitiveData = sensitiveDataRepository.findByDocumentId(documentId);
        if (!sensitiveData.isEmpty()) {
            sensitiveDataRepository.deleteAll(sensitiveData);
        }

        List<Risk> risks = riskRepository.findByDocumentId(documentId);
        for (Risk risk : risks) {
            List<Recommendation> recommendations = recommendationRepository.findByRiskId(risk.getId());
            if (!recommendations.isEmpty()) {
                recommendationRepository.deleteAll(recommendations);
            }
        }
        if (!risks.isEmpty()) {
            riskRepository.deleteAll(risks);
        }

        Asset asset = document.getAsset();
        document.setAsset(null);
        documentRepository.save(document);

        if (asset != null) {
            List<Document> remainingDocuments = documentRepository.findAll().stream()
                    .filter(existing -> existing.getAsset() != null && existing.getAsset().getId() != null && asset.getId() != null && existing.getAsset().getId().equals(asset.getId()))
                    .toList();
            if (remainingDocuments.isEmpty()) {
                assetRepository.delete(asset);
            } else {
                asset.setStatus(AssetStatus.INACTIF);
                assetRepository.save(asset);
            }
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        auditService.log(username, "DELETE_DOCUMENT", "Document", documentId,
                "Suppression du document: " + document.getFileName());

        documentRepository.delete(document);
    }

    private void collectFiles(File folder, Folder folderEntity, List<Document> scannedDocuments, ScanStats stats) {
        File[] files = folder.listFiles();
        if (files == null) {
            return;
        }

        for (File file : files) {
            if (file.isDirectory()) {
                Folder childFolder = getOrCreateFolder(file, folderEntity);
                collectFiles(file, childFolder, scannedDocuments, stats);
            } else if (file.isFile()) {
                try {
                    Document document = saveOrUpdateDocument(file, folderEntity, stats);
                    scannedDocuments.add(document);
                } catch (IOException e) {
                    System.err.println("Erreur lecture fichier: " + file.getAbsolutePath() + " — " + e.getMessage());
                }
            }
        }
    }

    private Document saveOrUpdateDocument(File file, Folder folderEntity, ScanStats stats) throws IOException {
        Path filePath = file.toPath();
        BasicFileAttributes attrs = Files.readAttributes(filePath, BasicFileAttributes.class);
        String absolutePath = file.getAbsolutePath();

        Optional<Document> existing = documentRepository.findFirstByFilePathOrderByIdDesc(absolutePath);
        Document document = existing.orElseGet(Document::new);

        if (existing.isEmpty()) {
            stats.created++;
            document.setAnalysisStatus(AnalysisStatus.PENDING);
        } else {
            stats.updated++;
        }

        document.setFolder(folderEntity);
        document.setFileName(file.getName());
        document.setFilePath(absolutePath);
        document.setExtension(getFileExtension(file.getName()));
        document.setFileSize(file.length());
        document.setMimeType(Files.probeContentType(filePath));
        document.setCreatedDate(LocalDateTime.ofInstant(attrs.creationTime().toInstant(), ZoneId.systemDefault()));
        document.setModifiedDate(LocalDateTime.ofInstant(attrs.lastModifiedTime().toInstant(), ZoneId.systemDefault()));
        
        // Automatic classification
        if (existing.isEmpty()) {
            classifyDocument(document);
        }

        Document savedDocument = documentRepository.save(document);
        savedDocument.setAsset(createOrUpdateAsset(savedDocument, folderEntity));
        return documentRepository.save(savedDocument);
    }

    private Folder getOrCreateFolder(File directory, Folder parentFolderEntity) {
        String absolutePath = directory.getAbsolutePath();
        return folderRepository.findFirstByPathOrderByIdDesc(absolutePath).orElseGet(() -> {
            Folder folder = new Folder();
            folder.setName(directory.getName());
            folder.setPath(absolutePath);
            folder.setParent(parentFolderEntity);
            return folderRepository.save(folder);
        });
    }

    private Asset createOrUpdateAsset(Document document, Folder folderEntity) {
        if (document.getAsset() != null && document.getAsset().getId() != null) {
            Asset asset = document.getAsset();
            asset.setName(document.getFileName());
            asset.setAssetType(mapAssetType(document.getDocumentType()));
            asset.setDescription("Actif créé automatiquement à partir du document scanné");
            asset.setOwner("RSSI");
            asset.setCriticality(mapCriticality(document.getConfidentialityLevel()));
            asset.setStatus(AssetStatus.ACTIF);
            asset.setAnalysisStatus(document.getAnalysisStatus());
            asset.setConfidentialityLevel(document.getConfidentialityLevel());
            asset.setExtension(document.getExtension());
            asset.setPath(document.getFilePath());
            asset.setSize(document.getFileSize());
            asset.setFolder(folderEntity);
            asset.setCreationDate(document.getCreatedDate() != null ? document.getCreatedDate().toLocalDate() : LocalDate.now());
            asset.setLocation(folderEntity != null ? folderEntity.getPath() : "");
            asset.setResponsible("RSSI");
            asset.setState("ACTIF");
            return assetRepository.save(asset);
        }

        Optional<Asset> existingAsset = assetRepository.findByNameContainingIgnoreCase(document.getFileName()).stream()
                .filter(asset -> asset.getPath() != null && asset.getPath().equals(document.getFilePath()))
                .findFirst();

        Asset asset = existingAsset.orElseGet(Asset::new);
        asset.setName(document.getFileName());
        asset.setAssetType(mapAssetType(document.getDocumentType()));
        asset.setDescription("Actif créé automatiquement à partir du document scanné");
        asset.setOwner("RSSI");
        asset.setCriticality(mapCriticality(document.getConfidentialityLevel()));
        asset.setStatus(AssetStatus.ACTIF);
        asset.setAnalysisStatus(document.getAnalysisStatus());
        asset.setConfidentialityLevel(document.getConfidentialityLevel());
        asset.setExtension(document.getExtension());
        asset.setPath(document.getFilePath());
        asset.setSize(document.getFileSize());
        asset.setFolder(folderEntity);
        asset.setCreationDate(document.getCreatedDate() != null ? document.getCreatedDate().toLocalDate() : LocalDate.now());
        asset.setLocation(folderEntity != null ? folderEntity.getPath() : "");
        asset.setResponsible("RSSI");
        asset.setState("ACTIF");
        return assetRepository.save(asset);
    }

    private AssetType mapAssetType(DocumentType documentType) {
        if (documentType == null) {
            return AssetType.INFORMATIONNEL;
        }
        if (documentType == DocumentType.DOSSIER_RH) {
            return AssetType.HUMAIN;
        }
        if (documentType == DocumentType.POLITIQUE_SSI || documentType == DocumentType.PROCEDURE) {
            return AssetType.LOGICIEL;
        }
        if (documentType == DocumentType.CONTRAT || documentType == DocumentType.FACTURE) {
            return AssetType.ORGANISATIONNEL;
        }
        return AssetType.INFORMATIONNEL;
    }

    private Criticality mapCriticality(ConfidentialityLevel confidentialityLevel) {
        if (confidentialityLevel == null) {
            return Criticality.MOYENNE;
        }
        if (confidentialityLevel == ConfidentialityLevel.TRES_CONFIDENTIEL) {
            return Criticality.CRITIQUE;
        }
        if (confidentialityLevel == ConfidentialityLevel.CONFIDENTIEL) {
            return Criticality.ELEVEE;
        }
        if (confidentialityLevel == ConfidentialityLevel.INTERNE) {
            return Criticality.MOYENNE;
        }
        return Criticality.FAIBLE;
    }

    private void classifyDocument(Document document) {
        String fileName = document.getFileName().toLowerCase();
        String extension = document.getExtension().toLowerCase();
        
        // Classify document type using only values supported by the MySQL schema
        if (fileName.contains("contrat") || fileName.contains("contract")) {
            document.setDocumentType(DocumentType.CONTRAT);
        } else if (fileName.contains("rh") || fileName.contains("hr") || fileName.contains("cv") || fileName.contains("resume")) {
            document.setDocumentType(DocumentType.DOSSIER_RH);
        } else if (fileName.contains("facture") || fileName.contains("invoice") || fileName.contains("devis")) {
            document.setDocumentType(DocumentType.FACTURE);
        } else if (fileName.contains("technique") || fileName.contains("tech") || fileName.contains("spec")) {
            document.setDocumentType(DocumentType.PROCEDURE);
        } else if (fileName.contains("juridique") || fileName.contains("legal") || fileName.contains("loi")) {
            document.setDocumentType(DocumentType.PROCEDURE);
        } else if (fileName.contains("comptable") || fileName.contains("accounting")) {
            document.setDocumentType(DocumentType.RAPPORT);
        } else if (fileName.contains("commercial") || fileName.contains("marketing")) {
            document.setDocumentType(DocumentType.RAPPORT);
        } else if (fileName.contains("politique") || fileName.contains("policy")) {
            document.setDocumentType(DocumentType.POLITIQUE_SSI);
        } else if (fileName.contains("note") || fileName.contains("interne")) {
            document.setDocumentType(DocumentType.NOTE_INTERNE);
        } else {
            document.setDocumentType(DocumentType.AUTRE);
        }

        // Classify confidentiality level using only values supported by the MySQL schema
        if (fileName.contains("confidentiel") || fileName.contains("secret") || fileName.contains("prive")) {
            document.setConfidentialityLevel(ConfidentialityLevel.TRES_CONFIDENTIEL);
        } else if (fileName.contains("sensible") || fileName.contains("sensitive")) {
            document.setConfidentialityLevel(ConfidentialityLevel.CONFIDENTIEL);
        } else if (fileName.contains("interne") || fileName.contains("internal")) {
            document.setConfidentialityLevel(ConfidentialityLevel.INTERNE);
        } else if (fileName.contains("public") || fileName.contains("publique")) {
            document.setConfidentialityLevel(ConfidentialityLevel.PUBLIC);
        } else {
            if (DocumentType.DOSSIER_RH.equals(document.getDocumentType()) || DocumentType.FACTURE.equals(document.getDocumentType())) {
                document.setConfidentialityLevel(ConfidentialityLevel.CONFIDENTIEL);
            } else {
                document.setConfidentialityLevel(ConfidentialityLevel.INTERNE);
            }
        }
    }

    private String getFileExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot == -1 ? "" : fileName.substring(dot + 1).toLowerCase();
    }

    private static class ScanStats {
        int created;
        int updated;
    }
}
