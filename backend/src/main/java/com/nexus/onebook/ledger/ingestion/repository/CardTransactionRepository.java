package com.nexus.onebook.ledger.ingestion.repository;

import com.nexus.onebook.ledger.ingestion.model.CardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardTransactionRepository extends JpaRepository<CardTransaction, Long> {

    Optional<CardTransaction> findByTenantIdAndExternalId(String tenantId, String externalId);

    List<CardTransaction> findByTenantIdAndPostedFalse(String tenantId);
}
