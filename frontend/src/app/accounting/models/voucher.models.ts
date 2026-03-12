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
