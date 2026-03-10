package com.nexus.onebook.ledger.ingestion.gateway;

import com.nexus.onebook.ledger.ingestion.mapper.UniversalMapper;
import com.nexus.onebook.ledger.ingestion.model.AdapterType;
import com.nexus.onebook.ledger.ingestion.model.EventStatus;
import com.nexus.onebook.ledger.ingestion.model.FinancialEvent;
import com.nexus.onebook.ledger.ingestion.repository.FinancialEventRepository;
import com.nexus.onebook.ledger.dto.JournalTransactionRequest;
import com.nexus.onebook.ledger.model.JournalTransaction;
import com.nexus.onebook.ledger.service.JournalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Financial Event Gateway — the central entry point for all external data ingestion.
 * Routes incoming payloads through the correct adapter, maps the normalised event
 * into a double-entry journal transaction, and posts it to the ledger.
 */
@Service
public class FinancialEventGateway {

    private final AdapterRegistry adapterRegistry;
    private final FinancialEventRepository eventRepository;
    private final UniversalMapper universalMapper;
    private final JournalService journalService;

    public FinancialEventGateway(AdapterRegistry adapterRegistry,
                                 FinancialEventRepository eventRepository,
                                 UniversalMapper universalMapper,
                                 JournalService journalService) {
        this.adapterRegistry = adapterRegistry;
        this.eventRepository = eventRepository;
        this.universalMapper = universalMapper;
        this.journalService = journalService;
    }

    /**
     * Ingests a raw payload through the specified adapter, persists the normalised
     * event, maps it to a journal transaction, and posts it to the ledger.
     *
     * @param tenantId    the tenant context
     * @param adapterType the adapter to use for parsing
     * @param rawPayload  the raw message from the external system
     * @return the persisted FinancialEvent with its final status
     */
    @Transactional
    public FinancialEvent ingest(String tenantId, AdapterType adapterType, String rawPayload) {
        FinancialEventAdapter adapter = adapterRegistry.getAdapter(adapterType);

        // 1. Parse
        FinancialEvent event;
        try {
            event = adapter.parse(tenantId, rawPayload);
            event.setStatus(EventStatus.VALIDATED);
        } catch (Exception e) {
            FinancialEvent failedEvent = new FinancialEvent(tenantId, adapterType, "PARSE_ERROR");
            failedEvent.setRawPayload(rawPayload);
            failedEvent.setStatus(EventStatus.FAILED);
            failedEvent.setErrorMessage(e.getMessage());
            return eventRepository.save(failedEvent);
        }

        // 2. Persist the validated event
        event = eventRepository.save(event);

        // 3. Map to journal transaction
        try {
            JournalTransactionRequest journalRequest = universalMapper.mapToJournalRequest(event);
            event.setStatus(EventStatus.MAPPED);

            // 4. Post to the ledger
            JournalTransaction posted = journalService.createTransaction(journalRequest);
            event.setStatus(EventStatus.POSTED);
            event.setSourceReference(posted.getTransactionUuid().toString());
        } catch (Exception e) {
            event.setStatus(EventStatus.FAILED);
            event.setErrorMessage("Mapping/posting failed: " + e.getMessage());
        }

        return eventRepository.save(event);
    }

    /**
     * Ingests and validates a raw payload without posting (dry run).
     * Useful for testing adapter parsing and validation.
     *
     * @param tenantId    the tenant context
     * @param adapterType the adapter to use for parsing
     * @param rawPayload  the raw message from the external system
     * @return the validated (but not posted) FinancialEvent
     */
    @Transactional
    public FinancialEvent ingestValidateOnly(String tenantId, AdapterType adapterType, String rawPayload) {
        FinancialEventAdapter adapter = adapterRegistry.getAdapter(adapterType);

        FinancialEvent event = adapter.parse(tenantId, rawPayload);
        event.setStatus(EventStatus.VALIDATED);
        return eventRepository.save(event);
    }
}
