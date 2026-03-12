package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.BomComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BomComponentRepository extends JpaRepository<BomComponent, Long> {
    List<BomComponent> findByBomId(Long bomId);
    List<BomComponent> findByTenantIdAndBomId(String tenantId, Long bomId);
}
