package com.copilot.rssi.controller;

import com.copilot.rssi.dto.response.ApiResponse;
import com.copilot.rssi.dto.response.DocumentResponse;
import com.copilot.rssi.dto.response.InventoryScanResponse;
import com.copilot.rssi.entity.Document;
import com.copilot.rssi.repository.DocumentRepository;
import com.copilot.rssi.service.interfaces.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventaire")
public class InventoryController {

    private final InventoryService inventoryService;
    private final DocumentRepository documentRepository;

    @PostMapping("/scan")
    @Operation(summary = "Scanner un dossier et inventorier les fichiers")
    public ApiResponse<InventoryScanResponse> triggerScan(@RequestBody Map<String, String> request) {
        String path = request.getOrDefault("directoryPath", request.get("path"));
        if (path == null || path.isBlank()) {
            return ApiResponse.error("Le chemin du dossier est obligatoire.");
        }
        InventoryScanResponse result = inventoryService.scanFolder(path.trim());
        return ApiResponse.ok("Scan terminé avec succès.", result);
    }

    @GetMapping("/documents")
    @Operation(summary = "Lister tous les documents inventoriés")
    public ApiResponse<List<DocumentResponse>> getDocuments() {
        return ApiResponse.ok(inventoryService.getAllDocuments());
    }

    @PostMapping("/documents/{id}/analyze")
    @Operation(summary = "Analyser un document avec l'IA")
    public ApiResponse<DocumentResponse> analyzeDocument(@PathVariable Long id) {
        return ApiResponse.ok("Analyse terminée.", inventoryService.analyzeDocument(id));
    }

    @DeleteMapping("/documents/{id}")
    @Operation(summary = "Supprimer un document")
    public ApiResponse<Void> deleteDocument(@PathVariable Long id) {
        inventoryService.deleteDocument(id);
        return ApiResponse.ok("Document supprimé avec succès.", null);
    }

    @GetMapping("/documents/{id}/preview")
    @Operation(summary = "Prévisualiser un document")
    public ResponseEntity<byte[]> previewDocument(@PathVariable Long id) throws IOException {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable: " + id));
        return serveDocument(document, false);
    }

    @GetMapping("/documents/{id}/download")
    @Operation(summary = "Télécharger un document")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) throws IOException {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable: " + id));
        return serveDocument(document, true);
    }

    private ResponseEntity<byte[]> serveDocument(Document document, boolean download) throws IOException {
        if (document.getFilePath() == null || document.getFilePath().isBlank()) {
            return ResponseEntity.notFound().build();
        }
        Path path = Path.of(document.getFilePath());
        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        String filename = document.getFileName() != null ? document.getFileName() : "document";
        headers.add(HttpHeaders.CONTENT_DISPOSITION, (download ? "attachment" : "inline") + "; filename=\"" + filename + "\"");
        return ResponseEntity.ok().headers(headers).body(Files.readAllBytes(path));
    }
}
