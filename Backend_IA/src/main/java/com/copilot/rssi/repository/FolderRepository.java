package com.copilot.rssi.repository;

import com.copilot.rssi.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    Optional<Folder> findByPath(String path);
    Optional<Folder> findFirstByPathOrderByIdDesc(String path);
}
