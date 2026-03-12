import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome to OneBook Enterprise Accounting</p>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <ul>
          <li><kbd>F4</kbd> Contra Voucher</li>
          <li><kbd>F5</kbd> Payment Voucher</li>
          <li><kbd>F6</kbd> Receipt Voucher</li>
          <li><kbd>F7</kbd> Journal Voucher</li>
          <li><kbd>F8</kbd> Sales Voucher</li>
          <li><kbd>F9</kbd> Purchase Voucher</li>
          <li><kbd>Ctrl+K</kbd> Command Palette</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 16px; }
    .quick-actions ul { list-style: none; padding: 0; }
    .quick-actions li { padding: 4px 0; }
    kbd {
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.85rem;
      font-family: inherit;
      margin-right: 8px;
    }
  `]
})
export class DashboardComponent {}
