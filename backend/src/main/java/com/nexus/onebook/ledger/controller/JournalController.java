package com.nexus.onebook.ledger.controller;

import com.nexus.onebook.ledger.dto.JournalTransactionRequest;
import com.nexus.onebook.ledger.model.JournalTransaction;
import com.nexus.onebook.ledger.repository.JournalTransactionRepository;
import com.nexus.onebook.ledger.service.JournalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for journal transaction operations.
 */
@RestController
@RequestMapping("/api/journal")
public class JournalController {

    private final JournalService journalService;
    private final JournalTransactionRepository transactionRepository;

    public JournalController(JournalService journalService,
                             JournalTransactionRepository transactionRepository) {
        this.journalService = journalService;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/transactions")
    public ResponseEntity<JournalTransaction> createTransaction(
            @Valid @RequestBody JournalTransactionRequest request) {
        JournalTransaction transaction = journalService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<JournalTransaction>> getTransactionsByTenant(
            @RequestParam String tenantId) {
        return ResponseEntity.ok(transactionRepository.findByTenantId(tenantId));
    }

    @GetMapping("/transactions/{uuid}")
    public ResponseEntity<JournalTransaction> getTransaction(@PathVariable UUID uuid) {
        JournalTransaction transaction = transactionRepository.findByTransactionUuid(uuid)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Transaction not found: " + uuid));
        return ResponseEntity.ok(transaction);
    }
}
