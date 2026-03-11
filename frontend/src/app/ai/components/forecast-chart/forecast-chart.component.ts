import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CashFlowForecast } from '../../models/ai.models';

@Component({
  selector: 'app-forecast-chart',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forecast-chart.component.html',
  styleUrl: './forecast-chart.component.scss'
})
export class ForecastChartComponent {
  readonly forecast = input.required<CashFlowForecast>();

  readonly riskColor = computed(() => {
    const level = this.forecast().riskLevel?.toUpperCase();
    switch (level) {
      case 'LOW': return '#22c55e';
      case 'MEDIUM': return '#f59e0b';
      case 'HIGH': return '#ef4444';
      default: return '#6b7280';
    }
  });
}
