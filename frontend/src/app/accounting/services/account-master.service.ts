import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, forkJoin, tap } from 'rxjs';
import {
  AccountGroup,
  AccountType,
  GroupNature,
  LedgerAccount,
} from '../models/voucher.models';

const TENANT_ID = 'default-tenant';

/** Shape returned by GET /api/ledger/accounts */
interface BackendLedgerAccount {
  id: number;
  tenantId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  active: boolean;
  metadata: string;
  parentAccount?: { id: number } | null;
  costCenter?: { id: number } | null;
  createdAt?: string;
}

/** Shape returned by GET /api/ledger/cost-centers */
interface BackendCostCenter {
  id: number;
  tenantId: string;
  code: string;
  name: string;
}

/**
 * Manages the Chart of Accounts — groups + ledger accounts.
 * Loads from the backend API; falls back to in-memory seeds when offline.
 */
@Injectable({ providedIn: 'root' })
export class AccountMasterService {
  private readonly http = inject(HttpClient);

  /* ── State ── */
  readonly groups = signal<AccountGroup[]>([]);
  readonly accounts = signal<LedgerAccount[]>([]);
  readonly costCenterId = signal<number>(0);
  readonly loading = signal(false);
  private initialized = false;

  /* ── Computed views ── */
  readonly activeAccounts = computed(() => this.accounts().filter(a => a.active));

  readonly primaryGroups = computed(() => this.groups().filter(g => g.isPrimary));

  readonly groupTree = computed(() => {
    const all = this.groups();
    const roots = all.filter(g => g.parentId === null);
    const build = (parent: AccountGroup): AccountGroup & { children: AccountGroup[] } => ({
      ...parent,
      children: all.filter(g => g.parentId === parent.id).map(build),
    });
    return roots.map(build);
  });

  accountsByGroup(groupId: number): LedgerAccount[] {
    return this.accounts().filter(a => a.groupId === groupId);
  }

  groupById(id: number): AccountGroup | undefined {
    return this.groups().find(g => g.id === id);
  }

  /* ── Bootstrap ── */
  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Always seed groups (frontend-only concept)
    this.seedDefaultGroups();

    // Try to load accounts from backend; fallback to local seeds
    this.loading.set(true);
    forkJoin({
      accounts: this.http.get<BackendLedgerAccount[]>('/api/ledger/accounts', {
        params: { tenantId: TENANT_ID },
      }).pipe(catchError(() => of(null))),
      costCenters: this.http.get<BackendCostCenter[]>('/api/ledger/cost-centers', {
        params: { tenantId: TENANT_ID },
      }).pipe(catchError(() => of(null))),
    }).subscribe(({ accounts, costCenters }) => {
      // Store cost center id
      if (costCenters?.length) {
        this.costCenterId.set(costCenters[0].id);
      }

      if (accounts?.length) {
        // Map backend accounts → frontend model with groupId from metadata
        const mapped = accounts.map(a => this.fromBackend(a));
        this.accounts.set(mapped);
      } else {
        // Backend offline or empty → seed defaults locally
        this.seedDefaultAccounts();
      }
      this.loading.set(false);
    });
  }

  /* ── CRUD: Ledger Account ── */
  createAccount(acct: Omit<LedgerAccount, 'id' | 'tenantId' | 'createdAt'>): LedgerAccount {
    const group = this.groupById(acct.groupId);
    const tempId = Date.now(); // temporary id until backend assigns real one

    const newAcct: LedgerAccount = {
      ...acct,
      id: tempId,
      tenantId: TENANT_ID,
      groupName: group?.name,
      createdAt: new Date().toISOString(),
    };

    // Add optimistically
    this.accounts.update(list => [...list, newAcct]);

    // POST to backend
    const ccId = this.costCenterId();
    if (ccId) {
      this.http.post<BackendLedgerAccount>('/api/ledger/accounts', {
        tenantId: TENANT_ID,
        costCenterId: ccId,
        accountCode: newAcct.accountCode,
        accountName: newAcct.accountName,
        accountType: newAcct.accountType,
        parentAccountId: newAcct.parentAccountId ?? null,
        metadata: JSON.stringify({ groupId: acct.groupId, groupName: group?.name }),
      }).pipe(
        tap(saved => {
          // Replace temp id with backend-assigned id
          const mapped = this.fromBackend(saved);
          this.accounts.update(list =>
            list.map(a => a.id === tempId ? mapped : a),
          );
        }),
        catchError(() => of(null)),
      ).subscribe();
    }

    return newAcct;
  }

  updateAccount(id: number, changes: Partial<LedgerAccount>): void {
    this.accounts.update(list =>
      list.map(a => a.id === id ? {
        ...a,
        ...changes,
        groupName: changes.groupId ? this.groupById(changes.groupId)?.name : a.groupName,
      } : a),
    );
  }

  deleteAccount(id: number): void {
    this.accounts.update(list => list.filter(a => a.id !== id));
  }

  /* ── CRUD: Account Group ── */
  createGroup(group: Omit<AccountGroup, 'id'>): AccountGroup {
    const nextId = Math.max(...this.groups().map(g => g.id), 99) + 1;
    const newGroup: AccountGroup = { ...group, id: nextId };
    this.groups.update(list => [...list, newGroup]);
    return newGroup;
  }

  /* ── Map backend → frontend model ── */
  private fromBackend(a: BackendLedgerAccount): LedgerAccount {
    let groupId = 0;
    let groupName: string | undefined;
    try {
      const meta = JSON.parse(a.metadata || '{}');
      groupId = meta.groupId ?? 0;
      groupName = meta.groupName ?? this.groupById(groupId)?.name;
    } catch { /* ignore parse errors */ }

    return {
      id: a.id,
      tenantId: a.tenantId,
      accountCode: a.accountCode,
      accountName: a.accountName,
      accountType: a.accountType,
      groupId,
      groupName,
      openingBalance: 0,
      active: a.active,
      parentAccountId: a.parentAccount?.id,
      createdAt: a.createdAt,
    };
  }

  /* ══════════════════════════════════════════════════════════
     Tally Default Groups — 15 Primary + 13 Sub-groups
     ══════════════════════════════════════════════════════════ */
  private seedDefaultGroups(): void {
    const G = (id: number, name: string, parentId: number | null, nature: GroupNature, isPrimary: boolean, agp = false): AccountGroup =>
      ({ id, name, parentId, nature, isPrimary, affectsGrossProfit: agp });

    const groups: AccountGroup[] = [
      // ── 15 PRIMARY GROUPS (Tally's reserved groups) ──
      G(1,  'Capital Account',           null, 'Liabilities', true),
      G(2,  'Current Assets',            null, 'Assets',      true),
      G(3,  'Current Liabilities',       null, 'Liabilities', true),
      G(4,  'Direct Expenses',           null, 'Expenses',    true, true),
      G(5,  'Direct Incomes',            null, 'Income',      true, true),
      G(6,  'Fixed Assets',              null, 'Assets',      true),
      G(7,  'Indirect Expenses',         null, 'Expenses',    true),
      G(8,  'Indirect Incomes',          null, 'Income',      true),
      G(9,  'Investments',               null, 'Assets',      true),
      G(10, 'Loans (Liability)',         null, 'Liabilities', true),
      G(11, 'Loans & Advances (Asset)',  null, 'Assets',      true),
      G(12, 'Misc. Expenses (Asset)',    null, 'Assets',      true),
      G(13, 'Purchase Accounts',         null, 'Expenses',    true, true),
      G(14, 'Sales Accounts',            null, 'Income',      true, true),
      G(15, 'Suspense A/c',             null, 'Liabilities', true),

      // ── SUB-GROUPS under Primary Groups ──
      G(16, 'Bank Accounts',            2,  'Assets',      false),
      G(17, 'Cash-in-Hand',             2,  'Assets',      false),
      G(18, 'Deposits (Asset)',          2,  'Assets',      false),
      G(19, 'Stock-in-Hand',            2,  'Assets',      false),
      G(20, 'Sundry Debtors',           2,  'Assets',      false),
      G(21, 'Sundry Creditors',         3,  'Liabilities', false),
      G(22, 'Duties & Taxes',           3,  'Liabilities', false),
      G(23, 'Provisions',               3,  'Liabilities', false),
      G(24, 'Bank OD A/c',             10, 'Liabilities', false),
      G(25, 'Secured Loans',           10, 'Liabilities', false),
      G(26, 'Unsecured Loans',         10, 'Liabilities', false),
      G(27, 'Reserves & Surplus',       1,  'Liabilities', false),
      G(28, 'Branch / Divisions',       null, 'Liabilities', false),
    ];

    this.groups.set(groups);
  }

  /* ══════════════════════════════════════════════════════════
     Tally Default Ledger Accounts (offline fallback only)
     ══════════════════════════════════════════════════════════ */
  private seedDefaultAccounts(): void {
    const A = (id: number, code: string, name: string, type: AccountType, groupId: number, balance = 0): LedgerAccount => ({
      id, tenantId: TENANT_ID, accountCode: code, accountName: name,
      accountType: type, groupId,
      groupName: this.groups().find(g => g.id === groupId)?.name,
      openingBalance: balance, active: true,
    });

    const accounts: LedgerAccount[] = [
      A(1,  'CASH',    'Cash',                       'ASSET', 17, 0),
      A(2,  'PETTY',   'Petty Cash',                 'ASSET', 17, 0),
      A(3,  'SBI-CA',  'Bank — SBI Current A/c',     'ASSET', 16, 0),
      A(4,  'HDFC-SA', 'Bank — HDFC Savings A/c',    'ASSET', 16, 0),
      A(5,  'ICICI',   'Bank — ICICI Current A/c',   'ASSET', 16, 0),
      A(6,  'CAP',     'Capital Account',             'EQUITY', 1, 0),
      A(7,  'DEB-01',  'Sunshine Enterprises',         'ASSET', 20, 0),
      A(8,  'DEB-02',  'Raj Traders',                  'ASSET', 20, 0),
      A(9,  'DEB-03',  'Priya Electronics',            'ASSET', 20, 0),
      A(10, 'CRD-01',  'ABC Suppliers',                'LIABILITY', 21, 0),
      A(11, 'CRD-02',  'XYZ Wholesalers',              'LIABILITY', 21, 0),
      A(12, 'CRD-03',  'Metro Distributors',           'LIABILITY', 21, 0),
      A(13, 'PUR',     'Purchase Account',             'EXPENSE', 13, 0),
      A(14, 'PUR-RET', 'Purchase Returns',             'EXPENSE', 13, 0),
      A(15, 'SAL',     'Sales Account',                'REVENUE', 14, 0),
      A(16, 'SAL-RET', 'Sales Returns',                'REVENUE', 14, 0),
      A(17, 'WAGES',   'Wages',                        'EXPENSE', 4, 0),
      A(18, 'FREIGHT', 'Freight Inward',               'EXPENSE', 4, 0),
      A(19, 'RENT',    'Rent',                         'EXPENSE', 7, 0),
      A(20, 'SALARY',  'Salary',                       'EXPENSE', 7, 0),
      A(21, 'ELECT',   'Electricity Charges',          'EXPENSE', 7, 0),
      A(22, 'TEL',     'Telephone Charges',            'EXPENSE', 7, 0),
      A(23, 'PRINT',   'Printing & Stationery',        'EXPENSE', 7, 0),
      A(24, 'CONV',    'Conveyance',                   'EXPENSE', 7, 0),
      A(25, 'MISC',    'Miscellaneous Expenses',       'EXPENSE', 7, 0),
      A(26, 'DEPREC',  'Depreciation',                 'EXPENSE', 7, 0),
      A(27, 'INT-REC', 'Interest Received',            'REVENUE', 8, 0),
      A(28, 'DISC-REC','Discount Received',            'REVENUE', 8, 0),
      A(29, 'COMM',    'Commission Received',          'REVENUE', 8, 0),
      A(30, 'DISC-AL', 'Discount Allowed',             'REVENUE', 5, 0),
      A(31, 'FURN',    'Furniture & Fixtures',          'ASSET', 6, 0),
      A(32, 'COMP',    'Computer & Peripherals',        'ASSET', 6, 0),
      A(33, 'VEHICLE', 'Vehicles',                      'ASSET', 6, 0),
      A(34, 'PLANT',   'Plant & Machinery',             'ASSET', 6, 0),
      A(35, 'LAND',    'Land & Building',               'ASSET', 6, 0),
      A(36, 'GST-INPUT',  'Input GST',                  'LIABILITY', 22, 0),
      A(37, 'GST-OUTPUT', 'Output GST',                 'LIABILITY', 22, 0),
      A(38, 'CGST',       'CGST',                       'LIABILITY', 22, 0),
      A(39, 'SGST',       'SGST',                       'LIABILITY', 22, 0),
      A(40, 'IGST',       'IGST',                       'LIABILITY', 22, 0),
      A(41, 'TDS',        'TDS Payable',                 'LIABILITY', 22, 0),
      A(42, 'LOAN-SBI', 'Term Loan — SBI',              'LIABILITY', 25, 0),
      A(43, 'ADV-STAFF', 'Staff Advances',               'ASSET', 11, 0),
      A(44, 'PREPAID',   'Prepaid Expenses',              'ASSET', 11, 0),
      A(45, 'DEP-RENT',  'Rent Deposit',                  'ASSET', 18, 0),
      A(46, 'DEP-ELEC',  'Electricity Deposit',           'ASSET', 18, 0),
      A(47, 'PROV-TAX', 'Provision for Taxation',         'LIABILITY', 23, 0),
      A(48, 'GEN-RES',  'General Reserve',                'EQUITY', 27, 0),
      A(49, 'PL-APPRO', 'Profit & Loss A/c',              'EQUITY', 27, 0),
      A(50, 'SUSPENSE', 'Suspense Account',                'LIABILITY', 15, 0),
    ];

    this.accounts.set(accounts);
  }
}
