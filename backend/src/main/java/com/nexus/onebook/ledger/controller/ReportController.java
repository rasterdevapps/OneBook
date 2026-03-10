package com.nexus.onebook.ledger.controller;

import com.nexus.onebook.ledger.dto.BalanceSheetReport;
import com.nexus.onebook.ledger.dto.CashFlowReport;
import com.nexus.onebook.ledger.dto.ProfitAndLossReport;
import com.nexus.onebook.ledger.service.BalanceSheetService;
import com.nexus.onebook.ledger.service.CashFlowService;
import com.nexus.onebook.ledger.service.ProfitAndLossService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for financial reporting.
 * Provides Profit & Loss, Balance Sheet, and Cash Flow Statement endpoints.
 * Part of the headless API — all responses are JSON for frontend/mobile consumption.
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ProfitAndLossService profitAndLossService;
    private final BalanceSheetService balanceSheetService;
    private final CashFlowService cashFlowService;

    public ReportController(ProfitAndLossService profitAndLossService,
                             BalanceSheetService balanceSheetService,
                             CashFlowService cashFlowService) {
        this.profitAndLossService = profitAndLossService;
        this.balanceSheetService = balanceSheetService;
        this.cashFlowService = cashFlowService;
    }

    @GetMapping("/profit-and-loss")
    public ResponseEntity<ProfitAndLossReport> getProfitAndLoss(@RequestParam String tenantId) {
        return ResponseEntity.ok(profitAndLossService.generateProfitAndLoss(tenantId));
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<BalanceSheetReport> getBalanceSheet(@RequestParam String tenantId) {
        return ResponseEntity.ok(balanceSheetService.generateBalanceSheet(tenantId));
    }

    @GetMapping("/cash-flow")
    public ResponseEntity<CashFlowReport> getCashFlow(@RequestParam String tenantId) {
        return ResponseEntity.ok(cashFlowService.generateCashFlow(tenantId));
    }
}
