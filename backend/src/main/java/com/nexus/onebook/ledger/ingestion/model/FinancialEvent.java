package com.nexus.onebook.ledger.ingestion.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * A normalised financial event ingested from any external system.
 * The raw payload is preserved for auditability while the normalised
 * fields drive downstream mapping into double-entry journal entries.
 */
@Entity
@Table(name = "financial_events")
public class FinancialEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "event_uuid", nullable = false, unique = true)
    private UUID eventUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "adapter_type", nullable = false, length = 30)
    private AdapterType adapterType;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "description")
    private String description;

    @Column(name = "amount", precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "source_reference", length = 255)
    private String sourceReference;

    @Column(name = "debit_account_code", length = 50)
    private String debitAccountCode;

    @Column(name = "credit_account_code", length = 50)
    private String creditAccountCode;

    @Column(name = "raw_payload", columnDefinition = "text")
    private String rawPayload;

    @Column(name = "industry_tags", columnDefinition = "text")
    private String industryTags = "{}";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EventStatus status = EventStatus.RECEIVED;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public FinancialEvent() {}

    public FinancialEvent(String tenantId, AdapterType adapterType, String eventType) {
        this.tenantId = tenantId;
        this.eventUuid = UUID.randomUUID();
        this.adapterType = adapterType;
        this.eventType = eventType;
    }

    @PrePersist
    protected void onCreate() {
        if (eventUuid == null) {
            eventUuid = UUID.randomUUID();
        }
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public UUID getEventUuid() { return eventUuid; }
    public void setEventUuid(UUID eventUuid) { this.eventUuid = eventUuid; }

    public AdapterType getAdapterType() { return adapterType; }
    public void setAdapterType(AdapterType adapterType) { this.adapterType = adapterType; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public String getSourceReference() { return sourceReference; }
    public void setSourceReference(String sourceReference) { this.sourceReference = sourceReference; }

    public String getDebitAccountCode() { return debitAccountCode; }
    public void setDebitAccountCode(String debitAccountCode) { this.debitAccountCode = debitAccountCode; }

    public String getCreditAccountCode() { return creditAccountCode; }
    public void setCreditAccountCode(String creditAccountCode) { this.creditAccountCode = creditAccountCode; }

    public String getRawPayload() { return rawPayload; }
    public void setRawPayload(String rawPayload) { this.rawPayload = rawPayload; }

    public String getIndustryTags() { return industryTags; }
    public void setIndustryTags(String industryTags) { this.industryTags = industryTags; }

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
