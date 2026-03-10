import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnomalyAlertComponent } from './anomaly-alert.component';
import { ComponentRef } from '@angular/core';

describe('AnomalyAlertComponent', () => {
  let component: AnomalyAlertComponent;
  let componentRef: ComponentRef<AnomalyAlertComponent>;
  let fixture: ComponentFixture<AnomalyAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnomalyAlertComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AnomalyAlertComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('anomalies', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
