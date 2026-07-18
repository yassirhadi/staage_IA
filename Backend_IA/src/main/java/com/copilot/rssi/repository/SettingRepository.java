package com.copilot.rssi.repository;

import com.copilot.rssi.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingRepository extends JpaRepository<Setting, Long> {
    // There's only one settings record in the database
    default Setting getOrCreateDefault() {
        return findAll().stream().findFirst().orElseGet(() -> {
            Setting setting = Setting.builder().build();
            return save(setting);
        });
    }
}
