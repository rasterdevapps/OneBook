import { Component, ChangeDetectionStrategy, inject, computed, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="reports-shell">
      <div class="reports-header">
        <h1>{{ reportLabel() }}</h1>
        <button class="btn btn-secondary" (click)="reload()">🔄 Refresh</button>
      </div>

      @if (svc.loading()) {
        <div class="loading">Loading report data…</div>
      }

      <!-- ═══ TRIAL BALANCE ═══ -->
      @if (reportType() === 'trial-balance' && svc.trialBalance(); as tb) {
        <table class="report-table">
          <thead>
            <tr><th>Account Code</th><th>Account Name</th><th>Type</th><th class="num">Debit (₹)</th><th class="num">Credit (₹)</th></tr>
          </thead>
          <tbody>
            @for (line of tb.lines; track line.accountId) {
              <tr>
                <td>{{ line.accountCode }}</td>
                <td>{{ line.accountName }}</td>
                <td>{{ line.accountType }}</td>
                <td class="num">{{ line.totalDebits | number:'1.2-2' }}</td>
                <td class="num">{{ line.totalCredits | number:'1.2-2' }}</td>
              </tr>
            }
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3">Total</td>
              <td class="num">{{ tb.totalDebits | number:'1.2-2' }}</td>
              <td class="num">{{ tb.totalCredits | number:'1.2-2' }}</td>
            </tr>
            <tr><td colspan="5" class="balance-status">{{ tb.balanced ? '✅ Balanced' : '⚠️ Unbalanced' }}</td></tr>
          </tfoot>
        </table>
      }

      <!-- ═══ PROFIT & LOSS ═══ -->
      @if (reportType() === 'profit-loss' && svc.profitAndLoss(); as pl) {
        <div class="pl-sections">
          <div class="pl-section">
            <h3>Revenue / Income</h3>
            <table class="report-table">
              <thead><tr><th>Account</th><th class="num">Credit (₹)</th></tr></thead>
              <tbody>
                @for (line of pl.revenueLines; track line.accountId) {
                  <tr><td>{{ line.accountName }}</td><td class="num">{{ line.totalCredits | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot><tr class="total-row"><td>Total Revenue</td><td class="num">{{ pl.totalRevenue | number:'1.2-2' }}</td></tr></tfoot>
            </table>
          </div>
          <div class="pl-section">
            <h3>Expenses</h3>
            <table class="report-table">
              <thead><tr><th>Account</th><th class="num">Debit (₹)</th></tr></thead>
              <tbody>
                @for (line of pl.expenseLines; track line.accountId) {
                  <tr><td>{{ line.accountName }}</td><td class="num">{{ line.totalDebits | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot><tr class="total-row"><td>Total Expenses</td><td class="num">{{ pl.totalExpenses | number:'1.2-2' }}</td></tr></tfoot>
            </table>
          </div>
          <div class="net-income" [class.profit]="pl.netIncome >= 0" [class.loss]="pl.netIncome < 0">
            <strong>{{ pl.netIncome >= 0 ? 'Net Profit' : 'Net Loss' }}:</strong>
            ₹{{ (pl.netIncome < 0 ? -pl.netIncome : pl.netIncome) | number:'1.2-2' }}
          </div>
        </div>
      }

      <!-- ═══ BALANCE SHEET ═══ -->
      @if (reportType() === 'balance-sheet' && svc.balanceSheet(); as bs) {
        <div class="bs-sections">
          <div class="bs-section">
            <h3>Assets</h3>
            <table class="report-table">
              <thead><tr><th>Account</th><th class="num">Amount (₹)</th></tr></thead>
              <tbody>
                @for (line of bs.assetLines; track line.accountId) {
                  <tr><td>{{ line.accountName }}</td><td class="num">{{ line.totalDebits - line.totalCredits | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot><tr class="total-row"><td>Total Assets</td><td class="num">{{ bs.totalAssets | number:'1.2-2' }}</td></tr></tfoot>
            </table>
          </div>
          <div class="bs-section">
            <h3>Liabilities</h3>
            <table class="report-table">
              <thead><tr><th>Account</th><th class="num">Amount (₹)</th></tr></thead>
              <tbody>
                @for (line of bs.liabilityLines; track line.accountId) {
                  <tr><td>{{ line.accountName }}</td><td class="num">{{ line.totalCredits - line.totalDebits | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot><tr class="total-row"><td>Total Liabilities</td><td class="num">{{ bs.totalLiabilities | number:'1.2-2' }}</td></tr></tfoot>
            </table>
          </div>
          <div class="bs-section">
            <h3>Equity</h3>
            <table class="report-table">
              <thead><tr><th>Account</th><th class="num">Amount (₹)</th></tr></thead>
              <tbody>
                @for (line of bs.equityLines; track line.accountId) {
                  <tr><td>{{ line.accountName }}</td><td class="num">{{ line.totalCredits - line.totalDebits | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot><tr class="total-row"><td>Total Equity</td><td class="num">{{ bs.totalEquity | number:'1.2-2' }}</td></tr></tfoot>
            </table>
          </div>
          <div class="balance-status">{{ bs.balanced ? '✅ Balanced' : '⚠️ Unbalanced' }}</div>
        </div>
      }

      <!-- ═══ CASH FLOW ═══ -->
      @if (reportType() === 'cash-flow' && svc.cashFlow(); as cf) {
        <div class="cf-sections">
          <div class="cf-section">
            <h3>Operating Activities</h3>
            <table class="report-table">
              <tbody>
                @for (line of cf.operatingActivities; track line.accountName) {
                  <tr><td>{{ line.accountName }}</td><td class="num">{{ line.amount | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot><tr class="total-row"><td>Net Cash from Operating</td><td class="num">{{ cf.netCashFromOperating | number:'1.2-2' }}</td></tr></tfoot>
            </table>
          </div>
          <div class="cf-section">
            <h3>Investing Activities</h3>
            <table class="report-table">
              <tbody>
                @for (line of cf.investingActivities; track line.accountName) {
                  <tr><td>{{ line.accountName }}</td><td class="num">{{ line.amount | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot><tr class="total-row"><td>Net Cash from Investing</td><td class="num">{{ cf.netCashFromInvesting | number:'1.2-2' }}</td></tr></tfoot>
            </table>
          </div>
          <div class="cf-section">
            <h3>Financing Activities</h3>
            <table class="report-table">
              <tbody>
                @for (line of cf.financingActivities; track line.accountName) {
                  <tr><td>{{ line.accountName }}</td><td class="num">{{ line.amount | number:'1.2-2' }}</td></tr>
                }
              </tbody>
              <tfoot><tr class="total-row"><td>Net Cash from Financing</td><td class="num">{{ cf.netCashFromFinancing | number:'1.2-2' }}</td></tr></tfoot>
            </table>
          </div>
          <div class="net-income">
            <strong>Net Cash Change:</strong> ₹{{ cf.netCashChange | number:'1.2-2' }}
          </div>
        </div>
      }

      <!-- ═══ DAY BOOK ═══ -->
      @if (reportType() === 'daybook') {
        @if (svc.daybook().length === 0 && !svc.loading()) {
          <div class="empty-state">
            <p>No transactions recorded yet.</p>
          </div>
        } @else {
          <table class="report-table">
            <thead>
              <tr><th>Date</th><th>Type</th><th>Account</th><th>Dr/Cr</th><th class="num">Amount (₹)</th><th>Narration</th></tr>
            </thead>
            <tbody>
              @for (txn of svc.daybook(); track txn.transactionUuid) {
                @for (entry of txn.entries; track $index) {
                  <tr>
                    @if ($index === 0) {
                      <td [attr.rowspan]="txn.entries.length">{{ txn.transactionDate }}</td>
                      <td [attr.rowspan]="txn.entries.length">{{ txn.voucherType }}</td>
                    }
                    <td>{{ entry.accountName }}</td>
                    <td>{{ entry.entryType }}</td>
                    <td class="num">{{ entry.amount | number:'1.2-2' }}</td>
                    @if ($index === 0) {
                      <td [attr.rowspan]="txn.entries.length">{{ txn.description }}</td>
                    }
                  </tr>
                }
              }
            </tbody>
          </table>
        }
      }
    </div>
  `,
  styles: [`
    .reports-shell { padding: 16px; }
    .reports-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .reports-header h1 { margin: 0; font-size: 1.5rem; }
    .btn { padding: 6px 14px; border-radius: 4px; cursor: pointer; border: 1px solid #ccc; background: #fff; }
    .btn-secondary:hover { background: #f0f0f0; }
    .loading { padding: 24px; text-align: center; color: #888; }
    .empty-state { padding: 48px; text-align: center; color: #999; }
    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .report-table th, .report-table td { padding: 8px 12px; border-bottom: 1px solid #e0e0e0; text-align: left; }
    .report-table th { background: #f5f5f5; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
    .report-table .num { text-align: right; font-variant-numeric: tabular-nums; }
    .total-row td { font-weight: 700; border-top: 2px solid #333; }
    .balance-status { text-align: center; padding: 8px; font-weight: 600; }
    .pl-sections, .bs-sections, .cf-sections { display: flex; flex-wrap: wrap; gap: 24px; }
    .pl-section, .bs-section, .cf-section { flex: 1; min-width: 300px; }
    .pl-section h3, .bs-section h3, .cf-section h3 { margin: 0 0 8px; font-size: 1.1rem; color: #333; }
    .net-income { padding: 12px 16px; border-radius: 6px; font-size: 1.1rem; background: #f0f9ff; margin-top: 12px; width: 100%; }
    .net-income.profit { background: #f0fff0; color: #2e7d32; }
    .net-income.loss { background: #fff5f5; color: #c62828; }
  `]
})
export class ReportsComponent {
  readonly svc = inject(ReportsService);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap.pipe(map(p => p.get('type') ?? 'unknown')));
  readonly reportType = computed(() => this.params() ?? 'unknown');

  readonly reportLabel = computed(() => {
    const labels: Record<string, string> = {
      'trial-balance': 'Trial Balance',
      'profit-loss': 'Profit & Loss',
      'balance-sheet': 'Balance Sheet',
      'cash-flow': 'Cash Flow Statement',
      'daybook': 'Day Book',
    };
    return labels[this.reportType()] ?? this.reportType();
  });

  constructor() {
    effect(() => {
      const type = this.reportType();
      this.loadReport(type);
    });
  }

  reload(): void {
    this.loadReport(this.reportType());
  }

  private loadReport(type: string): void {
    switch (type) {
      case 'trial-balance': this.svc.loadTrialBalance(); break;
      case 'profit-loss': this.svc.loadProfitAndLoss(); break;
      case 'balance-sheet': this.svc.loadBalanceSheet(); break;
      case 'cash-flow': this.svc.loadCashFlow(); break;
      case 'daybook': this.svc.loadDaybook(); break;
    }
  }
}
