package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.AssetStatus;
import com.nexus.onebook.ledger.model.FixedAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FixedAssetRepository extends JpaRepository<FixedAsset, Long> {
    List<FixedAsset> findByTenantId(String tenantId);
    List<FixedAsset> findByTenantIdAndStatus(String tenantId, AssetStatus status);
    Optional<FixedAsset> findByTenantIdAndAssetCode(String tenantId, String assetCode);
    List<FixedAsset> findByTenantIdAndBranchId(String tenantId, Long branchId);
}
