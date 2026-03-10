package com.nexus.onebook.ledger.dto;

import java.math.BigDecimal;

public record CashFlowLine(
    String description,
    BigDecimal amount
) {}
