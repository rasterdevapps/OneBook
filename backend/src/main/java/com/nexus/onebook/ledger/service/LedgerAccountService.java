package com.nexus.onebook.ledger.service;

import com.nexus.onebook.ledger.dto.LedgerAccountRequest;
import com.nexus.onebook.ledger.model.AccountType;
import com.nexus.onebook.ledger.model.CostCenter;
import com.nexus.onebook.ledger.model.LedgerAccount;
import com.nexus.onebook.ledger.repository.CostCenterRepository;
import com.nexus.onebook.ledger.repository.LedgerAccountRepository;
import com.nexus.onebook.ledger.security.AuditLogService;
import com.nexus.onebook.ledger.security.BlindIndexService;
import com.nexus.onebook.ledger.security.FieldEncryptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for Chart of Accounts management.
 * Handles creation and retrieval of ledger accounts.
 * Integrates field-level encryption, blind indexing, and audit logging
 * as part of the Zero-Knowledge Security Layer.
 */
@Service
public class LedgerAccountService {

    private final LedgerAccountRepository accountRepository;
    private final CostCenterRepository costCenterRepository;
    private final FieldEncryptionService encryptionService;
    private final BlindIndexService blindIndexService;
    private final AuditLogService auditLogService;

    public LedgerAccountService(LedgerAccountRepository accountRepository,
                                CostCenterRepository costCenterRepository,
                                FieldEncryptionService encryptionService,
                                BlindIndexService blindIndexService,
                                AuditLogService auditLogService) {
        this.accountRepository = accountRepository;
        this.costCenterRepository = costCenterRepository;
        this.encryptionService = encryptionService;
        this.blindIndexService = blindIndexService;
        this.auditLogService = auditLogService;
    }

    /**
     * Creates a new ledger account in the Chart of Accounts.
     * The account name is encrypted (AES-256-GCM) and a blind index
     * (HMAC-SHA256) is generated for searchability.
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

        // Zero-Knowledge: encrypt account name and generate blind index
        account.setAccountNameEncrypted(encryptionService.encrypt(request.accountName()));
        account.setAccountNameBlindIndex(blindIndexService.generateBlindIndex(request.accountName()));

        if (request.parentAccountId() != null) {
            LedgerAccount parent = accountRepository.findById(request.parentAccountId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Parent account not found: " + request.parentAccountId()));
            account.setParentAccount(parent);
        }

        if (request.metadata() != null) {
            account.setMetadata(request.metadata());
        }

        LedgerAccount saved = accountRepository.save(account);

        // Audit trail: log the account creation
        auditLogService.logInsert(request.tenantId(), "ledger_accounts", saved.getId(),
                "{\"accountCode\":\"" + saved.getAccountCode() + "\"}");

        return saved;
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

    /**
     * Searches for accounts by name using the blind index.
     * The search term is hashed and compared against stored blind indexes,
     * so the database never sees the plaintext search term.
     */
    @Transactional(readOnly = true)
    public List<LedgerAccount> searchByNameBlindIndex(String tenantId, String accountName) {
        String blindIndex = blindIndexService.generateBlindIndex(accountName);
        return accountRepository.findByTenantIdAndAccountNameBlindIndex(tenantId, blindIndex);
    }
}
