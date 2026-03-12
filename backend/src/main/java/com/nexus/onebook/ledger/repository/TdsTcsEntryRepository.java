package com.nexus.onebook.ledger.repository;

import com.nexus.onebook.ledger.model.TdsTcsEntry;
import com.nexus.onebook.ledger.model.TdsTcsStatus;
import com.nexus.onebook.ledger.model.TdsTcsType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TdsTcsEntryRepository extends JpaRepository<TdsTcsEntry, Long> {
    List<TdsTcsEntry> findByTenantId(String tenantId);
    List<TdsTcsEntry> findByTenantIdAndEntryType(String tenantId, TdsTcsType entryType);
    List<TdsTcsEntry> findByTenantIdAndStatus(String tenantId, TdsTcsStatus status);
    List<TdsTcsEntry> findByTenantIdAndEntryTypeAndStatus(String tenantId, TdsTcsType entryType, TdsTcsStatus status);
}
