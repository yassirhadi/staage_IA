package com.copilot.rssi.service.interfaces;

import com.copilot.rssi.dto.response.FolderResponse;
import com.copilot.rssi.entity.Folder;

import java.util.List;

public interface FolderService {
    List<FolderResponse> getAll();
    FolderResponse getById(Long id);
    FolderResponse create(Folder folder);
    FolderResponse update(Long id, Folder folder);
    void delete(Long id);
}
