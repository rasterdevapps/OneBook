package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.AuditSampleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditSampleRequestRepository extends JpaRepository<AuditSampleRequest, Long> {

    List<AuditSampleRequest> findByTenantId(String tenantId);

    List<AuditSampleRequest> findByTenantIdAndStatus(String tenantId, String status);
}
