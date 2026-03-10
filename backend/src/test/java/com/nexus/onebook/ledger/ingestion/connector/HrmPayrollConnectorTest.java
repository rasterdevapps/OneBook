package com.nexus.onebook.ledger.ingestion.connector;

import com.nexus.onebook.ledger.ingestion.gateway.FinancialEventGateway;
import com.nexus.onebook.ledger.ingestion.model.AdapterType;
import com.nexus.onebook.ledger.ingestion.model.EventStatus;
import com.nexus.onebook.ledger.ingestion.model.FinancialEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrmPayrollConnectorTest {

    @Mock
    private FinancialEventGateway gateway;

    @InjectMocks
    private HrmPayrollConnector connector;

    @Test
    void processPayrollEvent_delegatesToGateway() {
        String payload = "{\"eventType\":\"SALARY\",\"amount\":5000,\"date\":\"2026-03-10\"}";
        FinancialEvent expected = new FinancialEvent("tenant-1", AdapterType.REST_WEBHOOK, "SALARY");
        expected.setStatus(EventStatus.POSTED);

        when(gateway.ingest("tenant-1", AdapterType.REST_WEBHOOK, payload)).thenReturn(expected);

        FinancialEvent result = connector.processPayrollEvent("tenant-1", payload);

        assertEquals(EventStatus.POSTED, result.getStatus());
        verify(gateway).ingest("tenant-1", AdapterType.REST_WEBHOOK, payload);
    }
}
