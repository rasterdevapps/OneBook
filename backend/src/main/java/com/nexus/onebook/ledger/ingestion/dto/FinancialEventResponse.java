package com.nexus.onebook.ledger.ingestion.dto;

import com.nexus.onebook.ledger.ingestion.model.EventStatus;
import java.util.UUID;

/**
 * Response DTO returned after a financial event is ingested.
 */
public record FinancialEventResponse(
        UUID eventUuid,
        EventStatus status,
        String message
) {}
