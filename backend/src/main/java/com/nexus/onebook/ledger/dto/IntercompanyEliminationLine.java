package com.nexus.onebook.ledger.dto;

import java.math.BigDecimal;

public record IntercompanyEliminationLine(
    Long sourceBranchId,
    String sourceBranchName,
    Long targetBranchId,
    String targetBranchName,
    BigDecimal amount,
    boolean eliminated
) {}
