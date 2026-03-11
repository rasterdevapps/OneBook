package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.AuditWorkflow;
import com.nexus.onebook.ledger.model.AuditWorkflowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditWorkflowRepository extends JpaRepository<AuditWorkflow, Long> {

    List<AuditWorkflow> findByTenantId(String tenantId);

    List<AuditWorkflow> findByTenantIdAndStatus(String tenantId, AuditWorkflowStatus status);
}
