package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.FeatureEntitlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeatureEntitlementRepository extends JpaRepository<FeatureEntitlement, Long> {
    List<FeatureEntitlement> findByTenantId(String tenantId);
    Optional<FeatureEntitlement> findByTenantIdAndFeatureCode(String tenantId, String featureCode);
    List<FeatureEntitlement> findByTenantIdAndEnabled(String tenantId, boolean enabled);
}
