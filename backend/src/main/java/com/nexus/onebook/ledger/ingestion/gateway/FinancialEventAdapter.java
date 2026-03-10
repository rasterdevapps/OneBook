package com.nexus.onebook.ledger.ingestion.gateway;

import com.nexus.onebook.ledger.ingestion.model.AdapterType;
import com.nexus.onebook.ledger.ingestion.model.FinancialEvent;

/**
 * Pluggable adapter interface for the Financial Event Gateway.
 * Each adapter parses raw payloads from a specific industry protocol
 * and produces normalised {@link FinancialEvent} objects.
 */
public interface FinancialEventAdapter {

    /**
     * Returns the adapter type this implementation handles.
     */
    AdapterType getAdapterType();

    /**
     * Parses a raw payload string into a normalised FinancialEvent.
     *
     * @param tenantId   the tenant context
     * @param rawPayload the raw message from the external system
     * @return a normalised FinancialEvent ready for mapping
     * @throws IllegalArgumentException if the payload cannot be parsed
     */
    FinancialEvent parse(String tenantId, String rawPayload);
}
