package com.nexus.onebook.ledger.controller;

import com.nexus.onebook.ledger.dto.LedgerAccountRequest;
import com.nexus.onebook.ledger.dto.TrialBalanceReport;
import com.nexus.onebook.ledger.model.LedgerAccount;
import com.nexus.onebook.ledger.service.LedgerAccountService;
import com.nexus.onebook.ledger.service.TrialBalanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Chart of Accounts and Trial Balance operations.
 */
@RestController
@RequestMapping("/api/ledger")
public class LedgerController {

    private final LedgerAccountService accountService;
    private final TrialBalanceService trialBalanceService;

    public LedgerController(LedgerAccountService accountService,
                            TrialBalanceService trialBalanceService) {
        this.accountService = accountService;
        this.trialBalanceService = trialBalanceService;
    }

    @PostMapping("/accounts")
    public ResponseEntity<LedgerAccount> createAccount(@Valid @RequestBody LedgerAccountRequest request) {
        LedgerAccount account = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<LedgerAccount>> getAccounts(@RequestParam String tenantId) {
        return ResponseEntity.ok(accountService.getAccountsByTenant(tenantId));
    }

    @GetMapping("/accounts/{id}")
    public ResponseEntity<LedgerAccount> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccount(id));
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<TrialBalanceReport> getTrialBalance(@RequestParam String tenantId) {
        return ResponseEntity.ok(trialBalanceService.generateTrialBalance(tenantId));
    }
}
