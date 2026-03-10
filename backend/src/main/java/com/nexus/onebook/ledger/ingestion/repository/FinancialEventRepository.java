package com.nexus.onebook.ledger.ingestion.repository;

import com.nexus.onebook.ledger.ingestion.model.EventStatus;
import com.nexus.onebook.ledger.ingestion.model.FinancialEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialEventRepository extends JpaRepository<FinancialEvent, Long> {

    Optional<FinancialEvent> findByEventUuid(UUID eventUuid);

    List<FinancialEvent> findByTenantIdAndStatus(String tenantId, EventStatus status);

    List<FinancialEvent> findByTenantId(String tenantId);
}
