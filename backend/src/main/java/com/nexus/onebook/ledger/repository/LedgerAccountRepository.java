package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.LedgerAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LedgerAccountRepository extends JpaRepository<LedgerAccount, Long> {

    List<LedgerAccount> findByTenantId(String tenantId);

    Optional<LedgerAccount> findByTenantIdAndCostCenterIdAndAccountCode(
            String tenantId, Long costCenterId, String accountCode);
}
