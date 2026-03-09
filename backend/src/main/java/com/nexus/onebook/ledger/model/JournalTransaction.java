package com.nexus.onebook.ledger.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Transaction header that groups related journal entries via a unique
 * transaction_uuid. No journal entry can exist without referencing
 * a JournalTransaction (FK constraint prevents orphan entries).
 */
@Entity
@Table(name = "journal_transactions")
public class JournalTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "transaction_uuid", nullable = false, unique = true)
    private UUID transactionUuid;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "description")
    private String description;

    @Column(name = "posted", nullable = false)
    private boolean posted = false;

    @Column(name = "metadata", columnDefinition = "text")
    private String metadata = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JournalEntry> entries = new ArrayList<>();

    public JournalTransaction() {}

    public JournalTransaction(String tenantId, LocalDate transactionDate, String description) {
        this.tenantId = tenantId;
        this.transactionUuid = UUID.randomUUID();
        this.transactionDate = transactionDate;
        this.description = description;
    }

    @PrePersist
    protected void onCreate() {
        if (transactionUuid == null) {
            transactionUuid = UUID.randomUUID();
        }
        createdAt = Instant.now();
    }

    public void addEntry(JournalEntry entry) {
        entries.add(entry);
        entry.setTransaction(this);
    }

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public UUID getTransactionUuid() { return transactionUuid; }
    public void setTransactionUuid(UUID transactionUuid) { this.transactionUuid = transactionUuid; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isPosted() { return posted; }
    public void setPosted(boolean posted) { this.posted = posted; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public Instant getCreatedAt() { return createdAt; }

    public List<JournalEntry> getEntries() { return entries; }
    public void setEntries(List<JournalEntry> entries) { this.entries = entries; }
}
