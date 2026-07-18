package com.copilot.rssi.repository;

import com.copilot.rssi.entity.Asset;
import com.copilot.rssi.entity.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByAssetType(AssetType assetType);
    List<Asset> findByNameContainingIgnoreCase(String name);
}
