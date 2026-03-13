/** Matches backend EntryType enum */
export type EntryType = 'DEBIT' | 'CREDIT';

/** Matches backend AccountType enum */
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

/** Tally-compatible account group nature */
export type GroupNature = 'Assets' | 'Liabilities' | 'Income' | 'Expenses';

/* ── Account Group (Tally-style hierarchy) ── */
export interface AccountGroup {
  id: number;
  name: string;
  parentId: number | null;
  nature: GroupNature;
  isPrimary: boolean;         // true for Tally's 15 primary groups
  affectsGrossProfit: boolean;
}

/** Matches backend VoucherCategory enum */
export type VoucherCategory =
  | 'SALES' | 'PURCHASE' | 'PAYMENT' | 'RECEIPT'
  | 'CONTRA' | 'JOURNAL' | 'CREDIT_NOTE' | 'DEBIT_NOTE';

/* ── Ledger Account (from GET /api/ledger/accounts) ── */
export interface LedgerAccount {
  id: number;
  tenantId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  groupId: number;            // FK to AccountGroup
  groupName?: string;         // resolved client-side
  openingBalance: number;     // Dr positive, Cr negative
  mailingName?: string;
  address?: string;
  active: boolean;
  parentAccountId?: number;
  createdAt?: string;
}

/* ── Journal Entry line (one side of a double-entry) ── */
export interface JournalEntryRequest {
  accountId: number;
  entryType: EntryType;
  amount: number;
  description?: string;
  metadata?: string;
}

/* ── Create / update transaction payload ── */
export interface JournalTransactionRequest {
  tenantId: string;
  transactionDate: string;   // ISO date yyyy-MM-dd
  description: string;
  metadata?: string;
  entries: JournalEntryRequest[];
}

/* ── Transaction returned from backend ── */
export interface JournalTransaction {
  id: number;
  tenantId: string;
  transactionUuid: string;
  transactionDate: string;
  description: string;
  posted: boolean;
  entries: JournalEntry[];
  createdAt: string;
}

export interface JournalEntry {
  id: number;
  tenantId: string;
  accountId: number;
  accountName?: string;        // resolved client-side
  entryType: EntryType;
  amount: number;
  description?: string;
  createdAt: string;
}

/* ── Contra-voucher view model (used by the component) ── */
export interface ContraVoucher {
  uuid: string;
  voucherNumber: string;       // auto-generated display number
  date: string;                // yyyy-MM-dd
  debitAccountId: number;
  debitAccountName: string;
  creditAccountId: number;
  creditAccountName: string;
  amount: number;
  narration: string;
  posted: boolean;
  createdAt: string;
}

/* ── Unified voucher view model (all voucher types) ── */
export interface Voucher {
  uuid: string;
  voucherType: VoucherCategory;
  voucherNumber: string;
  date: string;
  debitAccountId: number;
  debitAccountName: string;
  creditAccountId: number;
  creditAccountName: string;
  amount: number;
  narration: string;
  posted: boolean;
  createdAt: string;
}

/* ── Voucher type configuration ── */
export interface VoucherTypeConfig {
  label: string;
  fKey: string;
  prefix: string;
  /** Account group IDs allowed for debit side; empty = all */
  debitGroupIds: number[];
  /** Account group IDs allowed for credit side; empty = all */
  creditGroupIds: number[];
}

/**
 * Tally-compatible voucher type rules.
 * Group IDs from AccountMasterService:
 *   16 = Bank Accounts, 17 = Cash-in-Hand
 *   20 = Sundry Debtors, 21 = Sundry Creditors
 *   5 = Direct Expenses, 6 = Indirect Expenses
 *   7 = Direct Incomes, 8 = Indirect Incomes
 *   All other groups are fair game for Journal.
 */
export const VOUCHER_TYPE_CONFIG: Record<VoucherCategory, VoucherTypeConfig> = {
  CONTRA:      { label: 'Contra',       fKey: 'F4', prefix: 'CTR', debitGroupIds: [16, 17],               creditGroupIds: [16, 17] },
  PAYMENT:     { label: 'Payment',      fKey: 'F5', prefix: 'PMT', debitGroupIds: [],                     creditGroupIds: [16, 17] },
  RECEIPT:     { label: 'Receipt',      fKey: 'F6', prefix: 'RCT', debitGroupIds: [16, 17],               creditGroupIds: [] },
  JOURNAL:     { label: 'Journal',      fKey: 'F7', prefix: 'JRN', debitGroupIds: [],                     creditGroupIds: [] },
  SALES:       { label: 'Sales',        fKey: 'F8', prefix: 'SLS', debitGroupIds: [16, 17, 20],           creditGroupIds: [] },
  PURCHASE:    { label: 'Purchase',     fKey: 'F9', prefix: 'PUR', debitGroupIds: [],                     creditGroupIds: [16, 17, 21] },
  CREDIT_NOTE: { label: 'Credit Note',  fKey: '',   prefix: 'CN',  debitGroupIds: [],                     creditGroupIds: [] },
  DEBIT_NOTE:  { label: 'Debit Note',   fKey: '',   prefix: 'DN',  debitGroupIds: [],                     creditGroupIds: [] },
};

