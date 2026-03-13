import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MarketValuationComponent } from './market-valuation.component';

describe('MarketValuationComponent', () => {
  let component: MarketValuationComponent;
  let fixture: ComponentFixture<MarketValuationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketValuationComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketValuationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have MTM adjustments', () => {
    expect(component.mtmAdjustments().length).toBeGreaterThan(0);
  });

  it('should have AI suggestions', () => {
    expect(component.aiSuggestions().length).toBeGreaterThan(0);
  });

  it('should generate chart data points', () => {
    const points = component.chartDataPoints();
    expect(points).toBeTruthy();
    expect(points.split(' ').length).toBe(component.chartData().length);
  });

  it('should return correct action colors', () => {
    expect(component.actionColor('BUY')).toContain('emerald');
    expect(component.actionColor('SELL')).toContain('ef4444');
    expect(component.actionColor('HOLD')).toContain('amber');
  });
});
