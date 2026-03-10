package com.nexus.onebook.ledger.dto;

import java.math.BigDecimal;
import java.util.List;

public record ConsolidatedReport(
    String tenantId,
    BalanceSheetReport consolidatedBalanceSheet,
    ProfitAndLossReport consolidatedProfitAndLoss,
    List<IntercompanyEliminationLine> eliminations,
    BigDecimal totalEliminationAmount
) {}
