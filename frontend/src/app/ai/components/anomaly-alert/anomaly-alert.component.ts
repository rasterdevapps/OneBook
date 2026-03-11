import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { TransactionAnomaly } from '../../models/ai.models';

@Component({
  selector: 'app-anomaly-alert',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './anomaly-alert.component.html',
  styleUrl: './anomaly-alert.component.scss'
})
export class AnomalyAlertComponent {
  readonly anomalies = input.required<TransactionAnomaly[]>();

  severityColor(severity: string): string {
    switch (severity?.toUpperCase()) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#22c55e';
      default: return '#6b7280';
    }
  }
}
