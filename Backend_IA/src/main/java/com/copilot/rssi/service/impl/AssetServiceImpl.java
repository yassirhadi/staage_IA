package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.request.AssetRequest;
import com.copilot.rssi.dto.response.AssetResponse;
import com.copilot.rssi.entity.Asset;
import com.copilot.rssi.entity.Folder;
import com.copilot.rssi.exception.ResourceNotFoundException;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.AssetRepository;
import com.copilot.rssi.repository.FolderRepository;
import com.copilot.rssi.service.interfaces.AssetService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final FolderRepository folderRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional
    public AssetResponse create(AssetRequest request) {
        Asset asset = new Asset();
        asset.setName(safeText(request.getName(), "Actif sans nom"));
        asset.setAssetType(request.getAssetType() != null ? request.getAssetType() : com.copilot.rssi.entity.enums.AssetType.INFORMATIONNEL);
        asset.setDescription(safeText(request.getDescription(), "Aucune description"));
        asset.setOwner(safeText(request.getOwner(), "Non attribué"));
        asset.setCriticality(request.getCriticality() != null ? request.getCriticality() : asset.getCriticality());
        asset.setStatus(request.getStatus() != null ? request.getStatus() : asset.getStatus());
        asset.setAnalysisStatus(request.getAnalysisStatus() != null ? request.getAnalysisStatus() : asset.getAnalysisStatus());
        asset.setConfidentialityLevel(request.getConfidentialityLevel() != null ? request.getConfidentialityLevel() : asset.getConfidentialityLevel());
        asset.setExtension(safeText(request.getExtension(), ""));
        asset.setPath(safeText(request.getPath(), ""));
        asset.setSize(request.getSize());
        asset.setValue(request.getValue());
        asset.setCreationDate(request.getCreationDate());
        asset.setLocation(safeText(request.getLocation(), ""));
        asset.setResponsible(safeText(request.getResponsible(), ""));
        asset.setState(safeText(request.getState(), "ACTIF"));
        if (request.getFolderId() != null) {
            Folder folder = folderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder non trouvé avec l'ID: " + request.getFolderId()));
            asset.setFolder(folder);
        }
        Asset saved = assetRepository.save(asset);
        return mapper.toAssetResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetResponse getById(Long id) {
        return mapper.toAssetResponse(findAsset(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponse> getAll() {
        return assetRepository.findAll().stream()
                .map(mapper::toAssetResponse)
                .toList();
    }

    @Override
    @Transactional
    public AssetResponse update(Long id, AssetRequest request) {
        Asset asset = findAsset(id);
        asset.setName(safeText(request.getName(), asset.getName()));
        asset.setAssetType(request.getAssetType() != null ? request.getAssetType() : asset.getAssetType());
        asset.setDescription(safeText(request.getDescription(), asset.getDescription()));
        asset.setOwner(safeText(request.getOwner(), asset.getOwner()));
        asset.setCriticality(request.getCriticality() != null ? request.getCriticality() : asset.getCriticality());
        asset.setStatus(request.getStatus() != null ? request.getStatus() : asset.getStatus());
        asset.setAnalysisStatus(request.getAnalysisStatus() != null ? request.getAnalysisStatus() : asset.getAnalysisStatus());
        asset.setConfidentialityLevel(request.getConfidentialityLevel() != null ? request.getConfidentialityLevel() : asset.getConfidentialityLevel());
        asset.setExtension(safeText(request.getExtension(), asset.getExtension()));
        asset.setPath(safeText(request.getPath(), asset.getPath()));
        asset.setSize(request.getSize());
        asset.setValue(request.getValue());
        asset.setCreationDate(request.getCreationDate());
        asset.setLocation(safeText(request.getLocation(), asset.getLocation()));
        asset.setResponsible(safeText(request.getResponsible(), asset.getResponsible()));
        asset.setState(safeText(request.getState(), asset.getState()));
        if (request.getFolderId() != null) {
            Folder folder = folderRepository.findById(request.getFolderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Folder non trouvé avec l'ID: " + request.getFolderId()));
            asset.setFolder(folder);
        } else {
            asset.setFolder(null);
        }
        return mapper.toAssetResponse(assetRepository.save(asset));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        assetRepository.delete(findAsset(id));
    }

    private Asset findAsset(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset non trouvé avec l'ID: " + id));
    }

    private String safeText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}