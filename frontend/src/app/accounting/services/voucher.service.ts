import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import {
  LedgerAccount,
  JournalTransactionRequest,
  JournalTransaction,
  ContraVoucher,
} from '../models/voucher.models';
import { AccountMasterService } from './account-master.service';

const TENANT_ID = 'default-tenant';

/** Shape returned by GET /api/journal/transactions with nested entries */
interface BackendJournalTransaction {
  id: number;
  tenantId: string;
  transactionUuid: string;
  transactionDate: string;
  description: string;
  posted: boolean;
  metadata: string;
  entries: BackendJournalEntry[];
  createdAt: string;
}

interface BackendJournalEntry {
  id: number;
  tenantId: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  account: { id: number; accountName: string; accountCode: string } | null;
}

@Injectable({ providedIn: 'root' })
export class VoucherService {
  private readonly http = inject(HttpClient);
  private readonly masterSvc = inject(AccountMasterService);

  /* ── Ledger accounts — delegate to the master service ── */
  readonly accounts = this.masterSvc.accounts;

  /** Contra uses only Cash-in-Hand (17) + Bank Accounts (16) groups */
  readonly cashBankAccounts = computed(() =>
    this.accounts().filter(a => a.active && (a.groupId === 16 || a.groupId === 17))
  );

  /* ── Contra vouchers ── */
  readonly contraVouchers = signal<ContraVoucher[]>([]);
  private contraSeq = 0;

  /* ── Load ledger accounts from backend ── */
  loadAccounts(): Observable<LedgerAccount[]> {
    this.masterSvc.initialize();
    return of(this.accounts());
  }

  /* ── Load contra vouchers from backend ── */
  loadContraVouchers(): void {
    this.http.get<BackendJournalTransaction[]>('/api/journal/transactions', {
      params: { tenantId: TENANT_ID },
    }).pipe(
      map(txns => txns.filter(t => {
        try { return JSON.parse(t.metadata || '{}').voucherType === 'CONTRA'; }
        catch { return false; }
      })),
      map(txns => txns.map(t => this.backendToContraVoucher(t))),
      tap(cvs => {
        this.contraVouchers.set(cvs);
        this.contraSeq = cvs.length;
      }),
      catchError(() => of([])),
    ).subscribe();
  }

  /* ── Create a contra voucher (POST to backend) ── */
  createContraVoucher(
    date: string,
    debitAccountId: number,
    creditAccountId: number,
    amount: number,
    narration: string,
  ): Observable<ContraVoucher> {
    const req: JournalTransactionRequest = {
      tenantId: TENANT_ID,
      transactionDate: date,
      description: narration,
      metadata: JSON.stringify({ voucherType: 'CONTRA' }),
      entries: [
        { accountId: debitAccountId, entryType: 'DEBIT', amount },
        { accountId: creditAccountId, entryType: 'CREDIT', amount },
      ],
    };

    return this.http.post<BackendJournalTransaction>('/api/journal/transactions', req).pipe(
      map(txn => this.backendToContraVoucher(txn)),
      tap(cv => this.contraVouchers.update(list => [cv, ...list])),
      catchError(() => {
        const cv = this.offlineContraVoucher(date, debitAccountId, creditAccountId, amount, narration);
        this.contraVouchers.update(list => [cv, ...list]);
        return of(cv);
      }),
    );
  }

  /* ── Update a voucher (replace in local list) ── */
  updateContraVoucher(
    uuid: string,
    date: string,
    debitAccountId: number,
    creditAccountId: number,
    amount: number,
    narration: string,
  ): Observable<ContraVoucher> {
    const updated = this.buildContraVoucher(
      uuid,
      this.voucherNumberFor(uuid),
      date, debitAccountId, creditAccountId, amount, narration,
    );
    this.contraVouchers.update(list =>
      list.map(v => v.uuid === uuid ? updated : v),
    );
    return of(updated);
  }

  /* ── Delete ── */
  deleteContraVoucher(uuid: string): void {
    this.contraVouchers.update(list => list.filter(v => v.uuid !== uuid));
  }

  /* ── Helpers ── */
  private backendToContraVoucher(txn: BackendJournalTransaction): ContraVoucher {
    const dr = txn.entries.find(e => e.entryType === 'DEBIT');
    const cr = txn.entries.find(e => e.entryType === 'CREDIT');
    const accts = this.accounts();
    const drId = dr?.account?.id ?? 0;
    const crId = cr?.account?.id ?? 0;
    return {
      uuid: txn.transactionUuid,
      voucherNumber: this.nextVoucherNumber(),
      date: txn.transactionDate,
      debitAccountId: drId,
      debitAccountName: dr?.account?.accountName ?? accts.find(a => a.id === drId)?.accountName ?? `Account #${drId}`,
      creditAccountId: crId,
      creditAccountName: cr?.account?.accountName ?? accts.find(a => a.id === crId)?.accountName ?? `Account #${crId}`,
      amount: dr?.amount ?? cr?.amount ?? 0,
      narration: txn.description ?? '',
      posted: txn.posted,
      createdAt: txn.createdAt,
    };
  }

  private offlineContraVoucher(
    date: string, drId: number, crId: number, amount: number, narration: string,
  ): ContraVoucher {
    const uuid = crypto.randomUUID();
    return this.buildContraVoucher(uuid, this.nextVoucherNumber(), date, drId, crId, amount, narration);
  }

  private buildContraVoucher(
    uuid: string, vNum: string, date: string,
    drId: number, crId: number, amount: number, narration: string,
  ): ContraVoucher {
    const accts = this.accounts();
    return {
      uuid,
      voucherNumber: vNum,
      date,
      debitAccountId: drId,
      debitAccountName: accts.find(a => a.id === drId)?.accountName ?? `Account #${drId}`,
      creditAccountId: crId,
      creditAccountName: accts.find(a => a.id === crId)?.accountName ?? `Account #${crId}`,
      amount,
      narration,
      posted: false,
      createdAt: new Date().toISOString(),
    };
  }

  private nextVoucherNumber(): string {
    this.contraSeq++;
    return `CTR-${String(this.contraSeq).padStart(4, '0')}`;
  }

  private voucherNumberFor(uuid: string): string {
    return this.contraVouchers().find(v => v.uuid === uuid)?.voucherNumber ?? this.nextVoucherNumber();
  }
}
