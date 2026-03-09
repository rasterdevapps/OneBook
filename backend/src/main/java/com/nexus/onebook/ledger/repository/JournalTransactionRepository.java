package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.JournalTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JournalTransactionRepository extends JpaRepository<JournalTransaction, Long> {

    Optional<JournalTransaction> findByTransactionUuid(UUID transactionUuid);

    List<JournalTransaction> findByTenantId(String tenantId);
}
