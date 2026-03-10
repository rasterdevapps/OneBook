package com.nexus.onebook.ledger.ingestion.repository;

import com.nexus.onebook.ledger.ingestion.model.GoodsReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long> {

    Optional<GoodsReceipt> findByTenantIdAndPoNumber(String tenantId, String poNumber);
}
