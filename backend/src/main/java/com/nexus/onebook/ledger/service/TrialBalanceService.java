package com.nexus.onebook.ledger.service;

import com.nexus.onebook.ledger.cache.WarmCacheService;
import com.nexus.onebook.ledger.dto.TrialBalanceLine;
import com.nexus.onebook.ledger.dto.TrialBalanceReport;
import com.nexus.onebook.ledger.model.EntryType;
import com.nexus.onebook.ledger.model.JournalEntry;
import com.nexus.onebook.ledger.model.LedgerAccount;
import com.nexus.onebook.ledger.repository.JournalEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for generating trial balance reports.
 * Aggregates posted journal entries by account to produce
 * a trial balance showing total debits and credits per account.
 * Uses cache-aside pattern: check Redis first, fall back to DB.
 */
@Service
public class TrialBalanceService {

    private final JournalEntryRepository entryRepository;
    private final WarmCacheService warmCacheService;

    public TrialBalanceService(JournalEntryRepository entryRepository,
                               WarmCacheService warmCacheService) {
        this.entryRepository = entryRepository;
        this.warmCacheService = warmCacheService;
    }

    /**
     * Generates a trial balance report for a given tenant.
     * Uses cache-aside: returns cached result if available, otherwise
     * computes from DB and caches the result.
     *
     * @param tenantId the tenant identifier
     * @return a TrialBalanceReport with per-account totals and overall balance check
     */
    @Transactional(readOnly = true)
    public TrialBalanceReport generateTrialBalance(String tenantId) {
        // Cache-aside: try Redis first
        TrialBalanceReport cached = warmCacheService.getTrialBalance(tenantId);
        if (cached != null) {
            return cached;
        }

        TrialBalanceReport report = computeTrialBalance(tenantId);
        warmCacheService.putTrialBalance(tenantId, report);
        return report;
    }

    /**
     * Computes the trial balance from posted journal entries (DB-only, no cache).
     * This is extracted for use by both the cache-aside path and the warm-cache
     * population logic.
     */
    @Transactional(readOnly = true)
    public TrialBalanceReport computeTrialBalance(String tenantId) {
        List<JournalEntry> postedEntries = entryRepository.findPostedEntriesByTenantId(tenantId);

        // Aggregate by account
        Map<Long, AccountAggregator> aggregatorMap = new LinkedHashMap<>();

        for (JournalEntry entry : postedEntries) {
            LedgerAccount account = entry.getAccount();
            AccountAggregator agg = aggregatorMap.computeIfAbsent(
                    account.getId(),
                    id -> new AccountAggregator(account)
            );

            if (entry.getEntryType() == EntryType.DEBIT) {
                agg.totalDebits = agg.totalDebits.add(entry.getAmount());
            } else {
                agg.totalCredits = agg.totalCredits.add(entry.getAmount());
            }
        }

        // Build trial balance lines
        List<TrialBalanceLine> lines = new ArrayList<>();
        BigDecimal grandTotalDebits = BigDecimal.ZERO;
        BigDecimal grandTotalCredits = BigDecimal.ZERO;

        for (AccountAggregator agg : aggregatorMap.values()) {
            lines.add(new TrialBalanceLine(
                    agg.account.getId(),
                    agg.account.getAccountCode(),
                    agg.account.getAccountName(),
                    agg.account.getAccountType().name(),
                    agg.totalDebits,
                    agg.totalCredits
            ));
            grandTotalDebits = grandTotalDebits.add(agg.totalDebits);
            grandTotalCredits = grandTotalCredits.add(agg.totalCredits);
        }

        boolean balanced = grandTotalDebits.compareTo(grandTotalCredits) == 0;

        return new TrialBalanceReport(tenantId, lines, grandTotalDebits, grandTotalCredits, balanced);
    }

    /**
     * Internal helper for accumulating debit/credit totals per account.
     */
    private static class AccountAggregator {
        final LedgerAccount account;
        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;

        AccountAggregator(LedgerAccount account) {
            this.account = account;
        }
    }
}
