import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-banking',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="banking">
      <h1>Banking &amp; Reconciliation</h1>
      <p>Bank statement import, auto-matching, and reconciliation.</p>
    </div>
  `,
  styles: [`
    .banking { padding: 16px; }
  `]
})
export class BankingComponent {}
