import { Component, ChangeDetectionStrategy, inject, computed, signal, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, catchError, tap } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AccountMasterService } from '../../services/account-master.service';

const TENANT_ID = 'default-tenant';

interface LedgerEntry {
  date: string;
  voucherType: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
}

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ledger-shell">
      <div class="ledger-header">
        <h1>📖 Ledger</h1>
      </div>

      <!-- Account picker -->
      @if (!selectedAccountId()) {
        <div class="account-picker">
          <h3>Select a Ledger Account</h3>
          <input #search type="text" class="input search-input"
                 placeholder="Search accounts…"
                 (input)="searchTerm.set(search.value)" />
          <div class="account-list">
            @for (a of filteredAccounts(); track a.id) {
              <div class="account-item" (click)="selectAccount(a.id, a.accountName)">
                <span class="account-code">{{ a.accountCode }}</span>
                <span class="account-name">{{ a.accountName }}</span>
                <span class="account-type">{{ a.accountType }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Ledger view for selected account -->
      @if (selectedAccountId()) {
        <div class="ledger-view">
          <div class="ledger-title-bar">
            <button class="btn btn-secondary" (click)="clearSelection()">← Back to Accounts</button>
            <h2>{{ selectedAccountName() }}</h2>
          </div>

          @if (loading()) {
            <div class="loading">Loading transactions…</div>
          }

          @if (!loading() && ledgerEntries().length === 0) {
            <div class="empty-state">
              <p>No transactions for this account.</p>
            </div>
          }

          @if (ledgerEntries().length > 0) {
            <table class="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Voucher Type</th>
                  <th>Particulars</th>
                  <th class="num">Debit (₹)</th>
                  <th class="num">Credit (₹)</th>
                  <th class="num">Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of ledgerEntries(); track $index) {
                  <tr>
                    <td>{{ entry.date }}</td>
                    <td>{{ entry.voucherType }}</td>
                    <td>{{ entry.particulars }}</td>
                    <td class="num">{{ entry.debit ? (entry.debit | number:'1.2-2') : '' }}</td>
                    <td class="num">{{ entry.credit ? (entry.credit | number:'1.2-2') : '' }}</td>
                    <td class="num" [class.dr]="entry.balance >= 0" [class.cr]="entry.balance < 0">
                      {{ (entry.balance < 0 ? -entry.balance : entry.balance) | number:'1.2-2' }}
                      {{ entry.balance >= 0 ? 'Dr' : 'Cr' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .ledger-shell { padding: 16px; }
    .ledger-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .ledger-header h1 { margin: 0; font-size: 1.5rem; }
    .account-picker { max-width: 600px; }
    .account-picker h3 { margin: 0 0 12px; }
    .search-input { width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 12px; font-size: 0.95rem; }
    .account-list { max-height: 400px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; }
    .account-item { display: flex; gap: 12px; padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
    .account-item:hover { background: #f0f9ff; }
    .account-code { font-weight: 600; min-width: 80px; color: #555; }
    .account-name { flex: 1; }
    .account-type { font-size: 0.8rem; color: #888; text-transform: uppercase; }
    .ledger-view { }
    .ledger-title-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .ledger-title-bar h2 { margin: 0; font-size: 1.3rem; }
    .btn { padding: 6px 14px; border-radius: 4px; cursor: pointer; border: 1px solid #ccc; background: #fff; }
    .btn-secondary:hover { background: #f0f0f0; }
    .input { padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; }
    .loading { padding: 24px; text-align: center; color: #888; }
    .empty-state { padding: 48px; text-align: center; color: #999; }
    .ledger-table { width: 100%; border-collapse: collapse; }
    .ledger-table th, .ledger-table td { padding: 8px 12px; border-bottom: 1px solid #e0e0e0; text-align: left; }
    .ledger-table th { background: #f5f5f5; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
    .ledger-table .num { text-align: right; font-variant-numeric: tabular-nums; }
    .dr { color: #1565c0; }
    .cr { color: #c62828; }
  `]
})
export class LedgerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly masterSvc = inject(AccountMasterService);

  private readonly params = toSignal(this.route.paramMap.pipe(map(p => p.get('name'))));

  readonly searchTerm = signal('');
  readonly selectedAccountId = signal<number>(0);
  readonly selectedAccountName = signal('');
  readonly ledgerEntries = signal<LedgerEntry[]>([]);
  readonly loading = signal(false);

  readonly filteredAccounts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.masterSvc.accounts().filter(a => a.active);
    if (!term) return all;
    return all.filter(a =>
      a.accountName.toLowerCase().includes(term) ||
      a.accountCode.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.masterSvc.initialize();

    // If route has :name param, try to find and select that account
    effect(() => {
      const name = this.params();
      if (name) {
        const accounts = this.masterSvc.accounts();
        const found = accounts.find(a =>
          a.accountName.toLowerCase() === name.toLowerCase() ||
          a.accountCode.toLowerCase() === name.toLowerCase()
        );
        if (found) {
          this.selectAccount(found.id, found.accountName);
        }
      }
    });
  }

  selectAccount(id: number, name: string): void {
    this.selectedAccountId.set(id);
    this.selectedAccountName.set(name);
    this.loadLedger(id);
  }

  clearSelection(): void {
    this.selectedAccountId.set(0);
    this.selectedAccountName.set('');
    this.ledgerEntries.set([]);
  }

  private loadLedger(accountId: number): void {
    this.loading.set(true);
    this.http.get<any[]>('/api/journal/transactions', {
      params: { tenantId: TENANT_ID },
    }).pipe(
      map(txns => {
        const entries: LedgerEntry[] = [];
        let balance = 0;

        // Get opening balance from account
        const account = this.masterSvc.accounts().find(a => a.id === accountId);
        if (account?.openingBalance) {
          balance = account.openingBalance;
          entries.push({
            date: 'Opening',
            voucherType: '',
            particulars: 'Opening Balance',
            debit: balance > 0 ? balance : 0,
            credit: balance < 0 ? -balance : 0,
            balance,
          });
        }

        // Sort by date
        const sorted = txns.sort((a: any, b: any) =>
          (a.transactionDate ?? '').localeCompare(b.transactionDate ?? '')
        );

        for (const txn of sorted) {
          const relevantEntries = (txn.entries ?? []).filter(
            (e: any) => e.account?.id === accountId
          );
          if (relevantEntries.length === 0) continue;

          let voucherType = 'JOURNAL';
          try { voucherType = JSON.parse(txn.metadata || '{}').voucherType ?? 'JOURNAL'; }
          catch { /* ignore */ }

          // Find the counterpart account names for "Particulars"
          const otherAccounts = (txn.entries ?? [])
            .filter((e: any) => e.account?.id !== accountId)
            .map((e: any) => e.account?.accountName ?? 'Unknown')
            .join(', ');

          for (const entry of relevantEntries) {
            const dr = entry.entryType === 'DEBIT' ? entry.amount : 0;
            const cr = entry.entryType === 'CREDIT' ? entry.amount : 0;
            balance += dr - cr;

            entries.push({
              date: txn.transactionDate,
              voucherType,
              particulars: otherAccounts || txn.description || '',
              debit: dr,
              credit: cr,
              balance,
            });
          }
        }

        return entries;
      }),
      tap(entries => {
        this.ledgerEntries.set(entries);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      }),
    ).subscribe();
  }
}
