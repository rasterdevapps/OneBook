package com.nexus.onebook.ledger.ingestion.model;

/**
 * Lifecycle status of a financial event as it moves through the ingestion pipeline.
 */
public enum EventStatus {
    RECEIVED,
    VALIDATED,
    MAPPED,
    POSTED,
    FAILED,
    REJECTED
}
