import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home / Dashboard (Omni-Command Center)
  { path: '', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },

  // Voucher Entry (F4-F9 shortcuts)
  { path: 'voucher/:type', loadComponent: () => import('./accounting/components/voucher-entry/voucher-entry.component').then(m => m.VoucherEntryComponent) },

  // Ledger
  { path: 'ledger', loadComponent: () => import('./accounting/components/ledger/ledger.component').then(m => m.LedgerComponent) },
  { path: 'ledger/:name', loadComponent: () => import('./accounting/components/ledger/ledger.component').then(m => m.LedgerComponent) },

  // Universal Accounts Receivable
  { path: 'receivable', loadComponent: () => import('./receivable/components/accounts-receivable/accounts-receivable.component').then(m => m.AccountsReceivableComponent) },

  // Reports (Alt+F2, F3, F5, F7)
  { path: 'reports/:type', loadComponent: () => import('./reports/components/reports/reports.component').then(m => m.ReportsComponent) },

  // Inventory
  { path: 'inventory', loadComponent: () => import('./inventory/components/inventory/inventory.component').then(m => m.InventoryComponent) },

  // GST & Compliance
  { path: 'gst', loadComponent: () => import('./gst/components/gst-dashboard/gst-dashboard.component').then(m => m.GstDashboardComponent) },

  // Masters (Alt+C, Alt+A, Alt+D)
  { path: 'master/:mode', loadComponent: () => import('./master/components/master/master.component').then(m => m.MasterComponent) },

  // Banking & Reconciliation
  { path: 'banking', loadComponent: () => import('./banking/components/banking/banking.component').then(m => m.BankingComponent) },

  // AI Insights
  { path: 'ai', loadComponent: () => import('./ai/components/ai-dashboard/ai-dashboard.component').then(m => m.AiDashboardComponent) },

  // Share Market Valuation Center
  { path: 'market', loadComponent: () => import('./market/components/market-valuation/market-valuation.component').then(m => m.MarketValuationComponent) },

  // Auditor Portal
  { path: 'auditor', loadComponent: () => import('./auditor/components/auditor-dashboard/auditor-dashboard.component').then(m => m.AuditorDashboardComponent) },

  // Catch-all redirect
  { path: '**', redirectTo: '' },
];
