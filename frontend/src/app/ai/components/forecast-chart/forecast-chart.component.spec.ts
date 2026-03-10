import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForecastChartComponent } from './forecast-chart.component';
import { ComponentRef } from '@angular/core';

describe('ForecastChartComponent', () => {
  let component: ForecastChartComponent;
  let componentRef: ComponentRef<ForecastChartComponent>;
  let fixture: ComponentFixture<ForecastChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForecastChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ForecastChartComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('forecast', {
      tenantId: 'tenant-1',
      currentCashPosition: 100000,
      forecast30Day: 110000,
      forecast60Day: 120000,
      forecast90Day: 130000,
      avgDailyInflow: 5000,
      avgDailyOutflow: 4000,
      riskLevel: 'LOW',
      generatedDate: '2025-01-01'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
