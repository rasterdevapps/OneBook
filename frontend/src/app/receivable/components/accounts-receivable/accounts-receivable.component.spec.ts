import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountsReceivableComponent } from './accounts-receivable.component';

describe('AccountsReceivableComponent', () => {
  let component: AccountsReceivableComponent;
  let fixture: ComponentFixture<AccountsReceivableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsReceivableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsReceivableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have receivable records', () => {
    expect(component.receivables().length).toBeGreaterThan(0);
  });

  it('should compute total outstanding', () => {
    expect(component.totalOutstanding()).toBeGreaterThan(0);
  });

  it('should toggle expand on a record', () => {
    const firstId = component.receivables()[0].id;
    expect(component.receivables()[0].expanded).toBeFalse();
    component.toggleExpand(firstId);
    expect(component.receivables().find(r => r.id === firstId)?.expanded).toBeTrue();
  });

  it('should generate AI payment prediction', () => {
    const firstId = component.receivables()[0].id;
    expect(component.receivables()[0].paymentPrediction).toBeUndefined();
    component.generatePrediction(firstId);
    expect(component.receivables().find(r => r.id === firstId)?.paymentPrediction).toBeTruthy();
  });

  it('should toggle block (Block)', () => {
    const firstId = component.receivables()[0].id;
    const wasBefore = component.receivables()[0].blocked;
    component.toggleBlock(firstId);
    expect(component.receivables().find(r => r.id === firstId)?.blocked).toBe(!wasBefore);
  });

  it('should filter by status', () => {
    component.setFilter('overdue');
    const filtered = component.filteredReceivables();
    expect(filtered.every(r => r.status === 'overdue')).toBeTrue();
  });

  it('should filter by search query', () => {
    component.updateSearch('MedCare');
    const filtered = component.filteredReceivables();
    expect(filtered.length).toBe(1);
    expect(filtered[0].customerName).toContain('MedCare');
  });

  it('should return correct status colors', () => {
    expect(component.statusColor('overdue')).toContain('amber');
    expect(component.statusColor('paid')).toContain('emerald');
    expect(component.statusColor('partial')).toContain('purple');
  });

  it('should return detail entries from record details', () => {
    const details = { 'Key1': 'Value1', 'Key2': 'Value2' };
    const entries = component.detailEntries(details);
    expect(entries.length).toBe(2);
    expect(entries[0]).toEqual(['Key1', 'Value1']);
  });
});
