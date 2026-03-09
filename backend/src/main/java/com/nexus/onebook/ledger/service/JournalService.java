package com.nexus.onebook.ledger.service;

import com.nexus.onebook.ledger.dto.JournalEntryRequest;
import com.nexus.onebook.ledger.dto.JournalTransactionRequest;
import com.nexus.onebook.ledger.exception.UnbalancedTransactionException;
import com.nexus.onebook.ledger.model.*;
import com.nexus.onebook.ledger.repository.JournalTransactionRepository;
import com.nexus.onebook.ledger.repository.LedgerAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Core double-entry accounting service.
 * Validates that sum(debits) == sum(credits) before any transaction is committed.
 */
@Service
public class JournalService {

    private final JournalTransactionRepository transactionRepository;
    private final LedgerAccountRepository accountRepository;

    public JournalService(JournalTransactionRepository transactionRepository,
                          LedgerAccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    /**
     * Creates and persists a balanced journal transaction.
     *
     * @param request the transaction request containing all debit/credit entries
     * @return the persisted JournalTransaction
     * @throws UnbalancedTransactionException if debits and credits do not balance
     * @throws IllegalArgumentException       if entries are missing or invalid
     */
    @Transactional
    public JournalTransaction createTransaction(JournalTransactionRequest request) {
        List<JournalEntryRequest> entryRequests = request.entries();

        // 1. Validate the entries balance
        validateBalance(entryRequests);

        // 2. Build the transaction header
        JournalTransaction transaction = new JournalTransaction(
                request.tenantId(),
                request.transactionDate(),
                request.description()
        );
        if (request.metadata() != null) {
            transaction.setMetadata(request.metadata());
        }

        // 3. Build and attach each entry line
        for (JournalEntryRequest entryReq : entryRequests) {
            LedgerAccount account = accountRepository.findById(entryReq.accountId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Ledger account not found: " + entryReq.accountId()));

            EntryType entryType = EntryType.valueOf(entryReq.entryType());

            JournalEntry entry = new JournalEntry(
                    request.tenantId(),
                    account,
                    entryType,
                    entryReq.amount(),
                    entryReq.description()
            );
            if (entryReq.metadata() != null) {
                entry.setMetadata(entryReq.metadata());
            }

            transaction.addEntry(entry);
        }

        return transactionRepository.save(transaction);
    }

    /**
     * Asserts that the journal entries satisfy double-entry rules:
     * <ul>
     *   <li>At least one DEBIT and one CREDIT entry must exist</li>
     *   <li>sum(debit amounts) must equal sum(credit amounts)</li>
     * </ul>
     *
     * @param entries the list of entry requests to validate
     * @throws UnbalancedTransactionException if validation fails
     */
    public void validateBalance(List<JournalEntryRequest> entries) {
        if (entries == null || entries.size() < 2) {
            throw new UnbalancedTransactionException(
                    "A transaction requires at least two entries (one debit and one credit)");
        }

        BigDecimal totalDebits = BigDecimal.ZERO;
        BigDecimal totalCredits = BigDecimal.ZERO;
        boolean hasDebit = false;
        boolean hasCredit = false;

        for (JournalEntryRequest entry : entries) {
            EntryType type = EntryType.valueOf(entry.entryType());
            BigDecimal amount = entry.amount();

            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new UnbalancedTransactionException(
                        "Entry amount must be greater than zero");
            }

            if (type == EntryType.DEBIT) {
                totalDebits = totalDebits.add(amount);
                hasDebit = true;
            } else {
                totalCredits = totalCredits.add(amount);
                hasCredit = true;
            }
        }

        if (!hasDebit || !hasCredit) {
            throw new UnbalancedTransactionException(
                    "Transaction must contain at least one debit and one credit entry");
        }

        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new UnbalancedTransactionException(
                    String.format("Transaction is unbalanced: total debits=%s, total credits=%s",
                            totalDebits.toPlainString(), totalCredits.toPlainString()));
        }
    }
}
