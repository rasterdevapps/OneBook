import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-gst-dashboard',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gst-dashboard">
      <h1>GST &amp; Tax Compliance</h1>
      <p>GSTR-1, GSTR-3B, e-Way Bill, and reconciliation tools.</p>
    </div>
  `,
  styles: [`
    .gst-dashboard { padding: 16px; }
  `]
})
export class GstDashboardComponent {}
