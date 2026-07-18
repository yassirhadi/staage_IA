package com.copilot.rssi.controller;

import com.copilot.rssi.dto.request.AssetRequest;
import com.copilot.rssi.dto.response.ApiResponse;
import com.copilot.rssi.dto.response.AssetResponse;
import com.copilot.rssi.service.interfaces.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assets")
@RequiredArgsConstructor
@Tag(name = "Actifs")
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    @Operation(summary = "Créer un actif")
    public ApiResponse<AssetResponse> create(@Valid @RequestBody AssetRequest request) {
        return ApiResponse.ok("Actif créé", assetService.create(request));
    }

    @GetMapping
    @Operation(summary = "Lister tous les actifs")
    public ApiResponse<List<AssetResponse>> getAll() {
        return ApiResponse.ok(assetService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un actif par ID")
    public ApiResponse<AssetResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(assetService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un actif")
    public ApiResponse<AssetResponse> update(@PathVariable Long id, @Valid @RequestBody AssetRequest request) {
        return ApiResponse.ok("Actif modifié", assetService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un actif")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        assetService.delete(id);
        return ApiResponse.ok("Actif supprimé", null);
    }
}
