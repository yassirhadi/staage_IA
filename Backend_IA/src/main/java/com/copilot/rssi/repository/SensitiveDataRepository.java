package com.copilot.rssi.repository;

import com.copilot.rssi.entity.SensitiveData;
import com.copilot.rssi.entity.enums.SensitiveDataType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SensitiveDataRepository extends JpaRepository<SensitiveData, Long> {
    List<SensitiveData> findByDocumentId(Long documentId);
    List<SensitiveData> findByDataType(SensitiveDataType dataType);
    void deleteByDocumentId(Long documentId);
}
