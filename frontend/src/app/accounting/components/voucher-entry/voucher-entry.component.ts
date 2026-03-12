import {
  Component, ChangeDetectionStrategy, OnInit, OnDestroy,
  inject, signal, computed, HostListener,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { VoucherService } from '../../services/voucher.service';
import { AccountMasterService } from '../../services/account-master.service';
import { ContraVoucher } from '../../models/voucher.models';

type ViewMode = 'list' | 'form';

@Component({
  selector: 'app-voucher-entry',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './voucher-entry.component.html',
  styleUrl: './voucher-entry.component.scss',
})
export class VoucherEntryComponent implements OnInit, OnDestroy {
  private readonly svc = inject(VoucherService);
  private readonly masterSvc = inject(AccountMasterService);

  /* ── View state ── */
  readonly mode = signal<ViewMode>('list');
  readonly editing = signal(false);
  readonly editingUuid = signal('');
  readonly editingVoucherNumber = signal('');
  readonly saving = signal(false);
  readonly selectedUuid = signal('');

  /* ── Data from service ── */
  readonly vouchers = this.svc.contraVouchers;

  /** Contra voucher: only Cash-in-Hand (group 17) + Bank Accounts (group 16) */
  readonly cashBankAccounts = computed(() =>
    this.masterSvc.accounts().filter(a => a.active && (a.groupId === 16 || a.groupId === 17))
  );

  readonly totalAmount = computed(() =>
    this.vouchers().reduce((sum, v) => sum + v.amount, 0)
  );

  /* ── Form fields ── */
  readonly formDate = signal(this.today());
  readonly formDebitAccountId = signal(0);
  readonly formCreditAccountId = signal(0);
  readonly formAmount = signal(0);
  readonly formNarration = signal('');
  readonly formError = signal('');

  ngOnInit(): void {
    // Initialize master accounts (loads from backend API, fallback to seeds)
    this.masterSvc.initialize();
    // Load existing contra vouchers from backend
    this.svc.loadContraVouchers();
  }

  ngOnDestroy(): void { /* cleanup if needed */ }

  /* ── Keyboard shortcuts ── */
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    // Ctrl+S or Ctrl+Enter → save
    if ((e.ctrlKey && e.key === 's') || (e.ctrlKey && e.key === 'Enter')) {
      if (this.mode() === 'form') {
        e.preventDefault();
        this.save();
      }
      return;
    }

    // Don't intercept when typing in inputs
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    if (e.key === 'c' || e.key === 'C') {
      if (this.mode() === 'list') { this.startCreate(); }
    } else if (e.key === 'Escape') {
      if (this.mode() === 'form') { this.backToList(); }
    } else if (e.key === 'Enter') {
      if (this.mode() === 'list' && this.selectedUuid()) {
        const v = this.vouchers().find(x => x.uuid === this.selectedUuid());
        if (v) this.startEdit(v);
      }
    } else if (e.key === 'Delete') {
      if (this.mode() === 'list' && this.selectedUuid()) {
        this.deleteVoucher(this.selectedUuid());
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      this.navigateList(e.key === 'ArrowDown' ? 1 : -1);
    }
  }

  /* ── Actions ── */
  startCreate(): void {
    this.resetForm();
    this.editing.set(false);
    this.mode.set('form');
  }

  startEdit(v: ContraVoucher): void {
    this.formDate.set(v.date);
    this.formDebitAccountId.set(v.debitAccountId);
    this.formCreditAccountId.set(v.creditAccountId);
    this.formAmount.set(v.amount);
    this.formNarration.set(v.narration);
    this.formError.set('');
    this.editing.set(true);
    this.editingUuid.set(v.uuid);
    this.editingVoucherNumber.set(v.voucherNumber);
    this.mode.set('form');
  }

  backToList(): void {
    this.mode.set('list');
  }

  selectVoucher(uuid: string): void {
    this.selectedUuid.set(uuid);
  }

  deleteVoucher(uuid: string): void {
    this.svc.deleteContraVoucher(uuid);
    if (this.selectedUuid() === uuid) this.selectedUuid.set('');
  }

  save(): void {
    // Validate
    const err = this.validate();
    if (err) { this.formError.set(err); return; }

    this.saving.set(true);
    this.formError.set('');

    const date = this.formDate();
    const drId = this.formDebitAccountId();
    const crId = this.formCreditAccountId();
    const amt = this.formAmount();
    const narr = this.formNarration();

    const obs$ = this.editing()
      ? this.svc.updateContraVoucher(this.editingUuid(), date, drId, crId, amt, narr)
      : this.svc.createContraVoucher(date, drId, crId, amt, narr);

    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.backToList();
      },
      error: () => {
        this.saving.set(false);
        this.formError.set('Failed to save. Please try again.');
      },
    });
  }

  /* ── Helpers ── */
  private validate(): string {
    if (!this.formDate()) return 'Date is required.';
    if (!this.formDebitAccountId()) return 'Please select a Debit (To) account.';
    if (!this.formCreditAccountId()) return 'Please select a Credit (By) account.';
    if (this.formDebitAccountId() === this.formCreditAccountId())
      return 'Debit and Credit accounts must be different.';
    if (!this.formAmount() || this.formAmount() <= 0)
      return 'Amount must be greater than zero.';
    return '';
  }

  private resetForm(): void {
    this.formDate.set(this.today());
    this.formDebitAccountId.set(0);
    this.formCreditAccountId.set(0);
    this.formAmount.set(0);
    this.formNarration.set('');
    this.formError.set('');
    this.editingUuid.set('');
    this.editingVoucherNumber.set('');
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private navigateList(dir: number): void {
    const list = this.vouchers();
    if (!list.length) return;
    const idx = list.findIndex(v => v.uuid === this.selectedUuid());
    const next = Math.max(0, Math.min(list.length - 1, idx + dir));
    this.selectedUuid.set(list[next].uuid);
  }
}
