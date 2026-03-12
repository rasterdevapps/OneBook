import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ledger">
      <h1>Ledger</h1>
      @if (ledgerName()) {
        <p>Viewing ledger: <strong>{{ ledgerName() }}</strong></p>
      } @else {
        <p>Select a ledger account to view transactions.</p>
      }
    </div>
  `,
  styles: [`
    .ledger { padding: 16px; }
  `]
})
export class LedgerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap.pipe(map(p => p.get('name'))));
  readonly ledgerName = computed(() => this.params() ?? '');
}
