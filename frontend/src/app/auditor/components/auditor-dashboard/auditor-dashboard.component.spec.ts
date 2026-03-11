import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuditorDashboardComponent } from './auditor-dashboard.component';

describe('AuditorDashboardComponent', () => {
  let component: AuditorDashboardComponent;
  let fixture: ComponentFixture<AuditorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditorDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
