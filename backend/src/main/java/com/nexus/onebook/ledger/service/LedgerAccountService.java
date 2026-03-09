package com.nexus.onebook.ledger.service;

import com.nexus.onebook.ledger.dto.LedgerAccountRequest;
import com.nexus.onebook.ledger.model.AccountType;
import com.nexus.onebook.ledger.model.CostCenter;
import com.nexus.onebook.ledger.model.LedgerAccount;
import com.nexus.onebook.ledger.repository.CostCenterRepository;
import com.nexus.onebook.ledger.repository.LedgerAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for Chart of Accounts management.
 * Handles creation and retrieval of ledger accounts.
 */
@Service
public class LedgerAccountService {

    private final LedgerAccountRepository accountRepository;
    private final CostCenterRepository costCenterRepository;

    public LedgerAccountService(LedgerAccountRepository accountRepository,
                                CostCenterRepository costCenterRepository) {
        this.accountRepository = accountRepository;
        this.costCenterRepository = costCenterRepository;
    }

    /**
     * Creates a new ledger account in the Chart of Accounts.
     *
     * @param request the account creation request
     * @return the persisted LedgerAccount
     * @throws IllegalArgumentException if cost center or parent account is not found,
     *                                  or if account code already exists in the cost center
     */
    @Transactional
    public LedgerAccount createAccount(LedgerAccountRequest request) {
        CostCenter costCenter = costCenterRepository.findById(request.costCenterId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Cost center not found: " + request.costCenterId()));

        // Check for duplicate account code within the same cost center and tenant
        accountRepository.findByTenantIdAndCostCenterIdAndAccountCode(
                request.tenantId(), request.costCenterId(), request.accountCode())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Account code already exists: " + request.accountCode());
                });

        AccountType accountType = AccountType.valueOf(request.accountType());

        LedgerAccount account = new LedgerAccount(
                request.tenantId(),
                costCenter,
                request.accountCode(),
                request.accountName(),
                accountType
        );

        if (request.parentAccountId() != null) {
            LedgerAccount parent = accountRepository.findById(request.parentAccountId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Parent account not found: " + request.parentAccountId()));
            account.setParentAccount(parent);
        }

        if (request.metadata() != null) {
            account.setMetadata(request.metadata());
        }

        return accountRepository.save(account);
    }

    /**
     * Retrieves all ledger accounts for a given tenant.
     */
    @Transactional(readOnly = true)
    public List<LedgerAccount> getAccountsByTenant(String tenantId) {
        return accountRepository.findByTenantId(tenantId);
    }

    /**
     * Retrieves a ledger account by ID.
     *
     * @throws IllegalArgumentException if the account is not found
     */
    @Transactional(readOnly = true)
    public LedgerAccount getAccount(Long accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Ledger account not found: " + accountId));
    }
}
