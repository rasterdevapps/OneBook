package com.nexus.onebook.ledger.ingestion.model;

/**
 * Status of the 3-way matching process.
 */
public enum MatchStatus {
    PENDING,
    MATCHED,
    PARTIAL,
    MISMATCHED,
    APPROVED,
    REJECTED
}
