package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.TenantLocaleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantLocaleConfigRepository extends JpaRepository<TenantLocaleConfig, Long> {
    Optional<TenantLocaleConfig> findByTenantId(String tenantId);
}
