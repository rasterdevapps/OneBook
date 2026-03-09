package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    List<JournalEntry> findByTransactionId(Long transactionId);

    /**
     * Retrieves all journal entries for a given tenant where the parent
     * transaction is posted, grouped by account. Used for trial balance.
     */
    @Query("SELECT e FROM JournalEntry e JOIN FETCH e.account " +
           "WHERE e.tenantId = :tenantId AND e.transaction.posted = true")
    List<JournalEntry> findPostedEntriesByTenantId(@Param("tenantId") String tenantId);
}
