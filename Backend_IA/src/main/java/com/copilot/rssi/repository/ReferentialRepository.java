package com.copilot.rssi.repository;

import com.copilot.rssi.entity.Referential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReferentialRepository extends JpaRepository<Referential, Long> {
    Optional<Referential> findByCode(String code);
    List<Referential> findByActiveTrue();
}
