package com.nexus.onebook.ledger.dto;

import java.math.BigDecimal;

/**
 * Response DTO for scenario modeling results.
 */
public record ScenarioResult(
        String tenantId,
        String scenarioName,
        BigDecimal baselineNetIncome,
        BigDecimal projectedNetIncome,
        BigDecimal projectedCashFlow,
        BigDecimal impactOnCash,
        BigDecimal impactPercent,
        String summary
) {}
