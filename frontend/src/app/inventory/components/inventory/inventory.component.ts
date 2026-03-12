import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inventory">
      <h1>Inventory</h1>
      <p>Stock items, groups, and godown management.</p>
    </div>
  `,
  styles: [`
    .inventory { padding: 16px; }
  `]
})
export class InventoryComponent {}
