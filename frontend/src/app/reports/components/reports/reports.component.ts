import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="reports">
      <h1>{{ reportLabel() }}</h1>
      <p>Report view for <strong>{{ reportType() }}</strong>.</p>
    </div>
  `,
  styles: [`
    .reports { padding: 16px; }
  `]
})
export class ReportsComponent {
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
}
