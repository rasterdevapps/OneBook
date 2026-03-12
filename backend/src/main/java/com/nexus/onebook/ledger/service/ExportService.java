package com.nexus.onebook.ledger.service;

import com.nexus.onebook.ledger.dto.*;
import com.nexus.onebook.ledger.model.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Export service — supports JSON and Excel export of financial data.
 * Provides structured export of ledger data, trial balances, and reports.
 */
@Service
public class ExportService {

    private final TrialBalanceService trialBalanceService;
    private final LedgerAccountService ledgerAccountService;

    public ExportService(TrialBalanceService trialBalanceService,
                         LedgerAccountService ledgerAccountService) {
        this.trialBalanceService = trialBalanceService;
        this.ledgerAccountService = ledgerAccountService;
    }

    /**
     * Exports trial balance as a structured map for JSON serialization.
     */
    public Map<String, Object> exportTrialBalanceAsJson(String tenantId) {
        TrialBalanceReport report = trialBalanceService.generateTrialBalance(tenantId);
        return Map.of(
                "reportType", "TRIAL_BALANCE",
                "tenantId", tenantId,
                "totalDebits", report.totalDebits(),
                "totalCredits", report.totalCredits(),
                "isBalanced", report.balanced(),
                "lines", report.lines()
        );
    }

    /**
     * Exports ledger accounts as a list of maps for JSON/CSV serialization.
     */
    public List<Map<String, Object>> exportLedgerAccountsAsJson(String tenantId) {
        List<LedgerAccount> accounts = ledgerAccountService.getAccountsByTenant(tenantId);
        return accounts.stream()
                .map(a -> Map.<String, Object>of(
                        "accountCode", a.getAccountCode(),
                        "accountName", a.getAccountName(),
                        "accountType", a.getAccountType().name(),
                        "isActive", a.isActive()
                ))
                .toList();
    }

    /**
     * Generates CSV-formatted string for ledger accounts export.
     */
    public String exportLedgerAccountsAsCsv(String tenantId) {
        List<LedgerAccount> accounts = ledgerAccountService.getAccountsByTenant(tenantId);
        StringBuilder csv = new StringBuilder("Account Code,Account Name,Account Type,Active\n");
        for (LedgerAccount account : accounts) {
            csv.append(account.getAccountCode()).append(",")
               .append(account.getAccountName()).append(",")
               .append(account.getAccountType().name()).append(",")
               .append(account.isActive()).append("\n");
        }
        return csv.toString();
    }
}
