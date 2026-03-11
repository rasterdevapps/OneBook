package com.nexus.onebook.ledger.dto;

import java.math.BigDecimal;

/**
 * Response DTO for a detected transaction anomaly.
 */
public record TransactionAnomaly(
        Long transactionId,
        String tenantId,
        String anomalyType,
        String description,
        BigDecimal amount,
        BigDecimal expectedRange,
        double confidenceScore,
        String severity
) {}
