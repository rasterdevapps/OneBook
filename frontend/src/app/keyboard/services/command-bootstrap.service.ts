import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommandRegistryService } from './command-registry.service';
import { KeyBindingRegistryService } from './key-binding-registry.service';
import { Command } from '../models';

/**
 * CommandBootstrapService — registers all default Tally-compatible commands
 * on application startup.
 *
 * Each command's action either navigates to the appropriate route or
 * logs the action to the console when the feature is not yet routed.
 * This bridges the gap between KeyBindingRegistryService (which defines
 * *what* shortcuts exist) and CommandRegistryService (which defines
 * *what to do* when they fire).
 */
@Injectable({ providedIn: 'root' })
export class CommandBootstrapService {

  private readonly commands = inject(CommandRegistryService);
  private readonly bindings = inject(KeyBindingRegistryService);
  private readonly router = inject(Router);

  /**
   * Call once at app startup (e.g. from AppComponent.ngOnInit)
   * to register every default command.
   */
  bootstrap(): void {
    const allBindings = this.bindings.bindings();

    const commandDefs: Command[] = allBindings
      .filter(b => b.id !== 'nav.commandPalette' && b.id !== 'nav.escape')
      .map(binding => ({
        id: binding.id,
        label: binding.label,
        category: binding.category,
        description: binding.description,
        keywords: this.keywordsFor(binding.id),
        action: this.actionFor(binding.id),
      }));

    this.commands.registerAll(commandDefs);
  }

  /** Build the navigation / execution action for a given binding id. */
  private actionFor(id: string): () => void {
    const routeMap: Record<string, string[]> = {
      // Voucher entries
      'voucher.contra':       ['/voucher', 'contra'],
      'voucher.payment':      ['/voucher', 'payment'],
      'voucher.receipt':      ['/voucher', 'receipt'],
      'voucher.journal':      ['/voucher', 'journal'],
      'voucher.sales':        ['/voucher', 'sales'],
      'voucher.purchase':     ['/voucher', 'purchase'],

      // Reports
      'report.daybook':       ['/reports', 'daybook'],
      'report.trialBalance':  ['/reports', 'trial-balance'],
      'report.profitLoss':    ['/reports', 'profit-loss'],
      'report.balanceSheet':  ['/reports', 'balance-sheet'],

      // Masters
      'master.create':        ['/master', 'create'],
      'master.alter':         ['/master', 'alter'],
      'master.display':       ['/master', 'display'],

      // AI
      'ai.dashboard':         ['/ai'],

      // Auditor
      'auditor.dashboard':    ['/auditor'],
    };

    const segments = routeMap[id];
    if (segments) {
      return () => {
        this.router.navigate(segments).catch(() =>
          console.warn(`[OneBook] Route not yet available: ${segments.join('/')}`)
        );
      };
    }

    // Action-type commands (save, delete, print, export) — emit a
    // console log for now; real handlers will be registered by each
    // feature module once they exist.
    return () => {
      console.log(`[OneBook] Command executed: ${id}`);
    };
  }

  /** Provide extra search keywords so the Command Palette can fuzzy-match. */
  private keywordsFor(id: string): string[] {
    const keywords: Record<string, string[]> = {
      'voucher.contra':       ['contra', 'bank', 'cash', 'transfer', 'F4'],
      'voucher.payment':      ['payment', 'pay', 'expense', 'F5'],
      'voucher.receipt':      ['receipt', 'receive', 'income', 'F6'],
      'voucher.journal':      ['journal', 'entry', 'adjustment', 'F7'],
      'voucher.sales':        ['sales', 'invoice', 'revenue', 'F8'],
      'voucher.purchase':     ['purchase', 'buy', 'procurement', 'F9'],

      'master.create':        ['create', 'new', 'add', 'ledger', 'account', 'group'],
      'master.alter':         ['alter', 'edit', 'modify', 'change', 'update'],
      'master.display':       ['display', 'view', 'show', 'details'],

      'action.save':          ['save', 'submit', 'confirm'],
      'action.delete':        ['delete', 'remove', 'discard'],
      'action.print':         ['print', 'pdf', 'output'],
      'action.export':        ['export', 'download', 'csv', 'excel'],

      'report.daybook':       ['daybook', 'day book', 'daily', 'transactions'],
      'report.trialBalance':  ['trial', 'balance', 'tb', 'trial balance'],
      'report.profitLoss':    ['profit', 'loss', 'p&l', 'income', 'statement'],
      'report.balanceSheet':  ['balance sheet', 'bs', 'assets', 'liabilities'],
    };
    return keywords[id] ?? [];
  }
}
