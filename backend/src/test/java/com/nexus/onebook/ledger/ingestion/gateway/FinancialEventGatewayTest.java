package com.nexus.onebook.ledger.ingestion.gateway;

import com.nexus.onebook.ledger.dto.JournalTransactionRequest;
import com.nexus.onebook.ledger.ingestion.mapper.UniversalMapper;
import com.nexus.onebook.ledger.ingestion.model.AdapterType;
import com.nexus.onebook.ledger.ingestion.model.EventStatus;
import com.nexus.onebook.ledger.ingestion.model.FinancialEvent;
import com.nexus.onebook.ledger.ingestion.repository.FinancialEventRepository;
import com.nexus.onebook.ledger.model.JournalTransaction;
import com.nexus.onebook.ledger.service.JournalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialEventGatewayTest {

    @Mock
    private AdapterRegistry adapterRegistry;

    @Mock
    private FinancialEventRepository eventRepository;

    @Mock
    private UniversalMapper universalMapper;

    @Mock
    private JournalService journalService;

    @InjectMocks
    private FinancialEventGateway gateway;

    private FinancialEvent validEvent;
    private JournalTransaction postedTransaction;

    @BeforeEach
    void setUp() {
        validEvent = new FinancialEvent("tenant-1", AdapterType.HL7, "CHARGE");
        validEvent.setAmount(new BigDecimal("1500.00"));
        validEvent.setCurrency("USD");
        validEvent.setEventDate(LocalDate.of(2026, 3, 10));
        validEvent.setDebitAccountCode("4100");
        validEvent.setCreditAccountCode("2100");

        postedTransaction = new JournalTransaction("tenant-1", LocalDate.of(2026, 3, 10), "Test");
        postedTransaction.setTransactionUuid(UUID.randomUUID());
    }

    @Test
    void ingest_validPayload_postsToLedger() {
        FinancialEventAdapter mockAdapter = mock(FinancialEventAdapter.class);
        when(adapterRegistry.getAdapter(AdapterType.HL7)).thenReturn(mockAdapter);
        when(mockAdapter.parse("tenant-1", "payload")).thenReturn(validEvent);
        when(eventRepository.save(any(FinancialEvent.class))).thenAnswer(inv -> inv.getArgument(0));
        when(universalMapper.mapToJournalRequest(any())).thenReturn(
                mock(JournalTransactionRequest.class));
        when(journalService.createTransaction(any())).thenReturn(postedTransaction);

        FinancialEvent result = gateway.ingest("tenant-1", AdapterType.HL7, "payload");

        assertEquals(EventStatus.POSTED, result.getStatus());
        verify(journalService).createTransaction(any());
    }

    @Test
    void ingest_parseError_returnsFailed() {
        FinancialEventAdapter mockAdapter = mock(FinancialEventAdapter.class);
        when(adapterRegistry.getAdapter(AdapterType.HL7)).thenReturn(mockAdapter);
        when(mockAdapter.parse(anyString(), anyString())).thenThrow(
                new IllegalArgumentException("Bad payload"));
        when(eventRepository.save(any(FinancialEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        FinancialEvent result = gateway.ingest("tenant-1", AdapterType.HL7, "bad");

        assertEquals(EventStatus.FAILED, result.getStatus());
        assertTrue(result.getErrorMessage().contains("Bad payload"));
        verify(journalService, never()).createTransaction(any());
    }

    @Test
    void ingest_mappingError_returnsFailed() {
        FinancialEventAdapter mockAdapter = mock(FinancialEventAdapter.class);
        when(adapterRegistry.getAdapter(AdapterType.HL7)).thenReturn(mockAdapter);
        when(mockAdapter.parse("tenant-1", "payload")).thenReturn(validEvent);
        when(eventRepository.save(any(FinancialEvent.class))).thenAnswer(inv -> inv.getArgument(0));
        when(universalMapper.mapToJournalRequest(any())).thenThrow(
                new IllegalArgumentException("Account not found"));

        FinancialEvent result = gateway.ingest("tenant-1", AdapterType.HL7, "payload");

        assertEquals(EventStatus.FAILED, result.getStatus());
        assertTrue(result.getErrorMessage().contains("Account not found"));
    }

    @Test
    void ingestValidateOnly_validPayload_returnsValidated() {
        FinancialEventAdapter mockAdapter = mock(FinancialEventAdapter.class);
        when(adapterRegistry.getAdapter(AdapterType.DMS)).thenReturn(mockAdapter);
        when(mockAdapter.parse("tenant-1", "payload")).thenReturn(validEvent);
        when(eventRepository.save(any(FinancialEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        FinancialEvent result = gateway.ingestValidateOnly("tenant-1", AdapterType.DMS, "payload");

        assertEquals(EventStatus.VALIDATED, result.getStatus());
        verify(journalService, never()).createTransaction(any());
    }
}
