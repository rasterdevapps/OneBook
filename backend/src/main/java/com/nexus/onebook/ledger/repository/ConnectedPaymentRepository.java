package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.ConnectedPayment;
import com.nexus.onebook.ledger.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConnectedPaymentRepository extends JpaRepository<ConnectedPayment, Long> {
    List<ConnectedPayment> findByTenantId(String tenantId);
    List<ConnectedPayment> findByTenantIdAndStatus(String tenantId, PaymentStatus status);
    List<ConnectedPayment> findByTenantIdAndBankAccountId(String tenantId, Long bankAccountId);
}
