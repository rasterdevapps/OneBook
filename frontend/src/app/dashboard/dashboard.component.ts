import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  /* ── AI Cash Flow Summary (demo data) ── */
  readonly cashFlowSummary = signal({
    currentBalance: 2847563.42,
    inflow30d: 1245000,
    outflow30d: 890000,
    netChange: 355000,
    trend: 'up' as const,
    sparkline: [42, 55, 48, 62, 58, 71, 65, 78, 72, 85, 80, 92],
  });

  /* ── Audit Log Chain ── */
  readonly auditEntries = signal([
    { hash: '0x8f2a...c4d1', action: 'Invoice #INV-2487 locked', timestamp: '2 min ago', verified: true },
    { hash: '0x3b7e...a9f2', action: 'Journal JV-1024 posted', timestamp: '8 min ago', verified: true },
    { hash: '0x1d4c...e8b3', action: 'Payment PMT-892 approved', timestamp: '15 min ago', verified: true },
    { hash: '0xf9a1...7c6e', action: 'Receipt RCT-445 created', timestamp: '22 min ago', verified: true },
    { hash: '0x6e8d...b2a5', action: 'Master account updated', timestamp: '34 min ago', verified: true },
  ]);

  /* ── Universal Ingestion Status ── */
  readonly ingestionSources = signal([
    { name: 'Healthcare HL7', icon: '🏥', status: 'active' as const, lastSync: '< 1 min', records: 12847 },
    { name: 'Auto DMS', icon: '🚗', status: 'active' as const, lastSync: '3 min', records: 8921 },
    { name: 'ISO 20022', icon: '🏦', status: 'active' as const, lastSync: '1 min', records: 34521 },
    { name: 'Webhook API', icon: '🔌', status: 'syncing' as const, lastSync: 'syncing...', records: 5643 },
  ]);

  /* ── Quick Actions ── */
  readonly shortcuts = [
    { key: 'F4', label: 'Contra', route: '/voucher/contra' },
    { key: 'F5', label: 'Payment', route: '/voucher/payment' },
    { key: 'F6', label: 'Receipt', route: '/voucher/receipt' },
    { key: 'F7', label: 'Journal', route: '/voucher/journal' },
    { key: 'F8', label: 'Sales', route: '/voucher/sales' },
    { key: 'F9', label: 'Purchase', route: '/voucher/purchase' },
  ];
}
