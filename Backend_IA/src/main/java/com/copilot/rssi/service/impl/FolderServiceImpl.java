package com.copilot.rssi.service.impl;

import com.copilot.rssi.dto.response.FolderResponse;
import com.copilot.rssi.entity.Folder;
import com.copilot.rssi.mapper.EntityMapper;
import com.copilot.rssi.repository.FolderRepository;
import com.copilot.rssi.service.interfaces.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FolderServiceImpl implements FolderService {
    private final FolderRepository folderRepository;
    private final EntityMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<FolderResponse> getAll() {
        return folderRepository.findAll().stream().map(mapper::toFolderResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FolderResponse getById(Long id) {
        return folderRepository.findById(id).map(mapper::toFolderResponse).orElse(null);
    }

    @Override
    @Transactional
    public FolderResponse create(Folder folder) {
        return mapper.toFolderResponse(folderRepository.save(folder));
    }

    @Override
    @Transactional
    public FolderResponse update(Long id, Folder folder) {
        return folderRepository.findById(id).map(existingFolder -> {
            if (folder.getName() != null) existingFolder.setName(folder.getName());
            if (folder.getPath() != null) existingFolder.setPath(folder.getPath());
            if (folder.getParent() != null) existingFolder.setParent(folder.getParent());
            if (folder.getScannedAt() != null) existingFolder.setScannedAt(folder.getScannedAt());
            return mapper.toFolderResponse(folderRepository.save(existingFolder));
        }).orElse(null);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        folderRepository.deleteById(id);
    }
}