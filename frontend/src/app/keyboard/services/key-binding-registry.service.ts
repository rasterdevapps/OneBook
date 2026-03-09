import { Injectable, signal, computed } from '@angular/core';
import { KeyBinding, ParsedKeyCombo } from '../models';

/**
 * Default Tally-compatible keyboard shortcuts.
 * Organized by category for easy management.
 */
const TALLY_DEFAULTS: KeyBinding[] = [
  // Voucher entry shortcuts
  { id: 'voucher.contra',     label: 'Contra Voucher',     keys: 'F4',     category: 'Vouchers',  description: 'Open Contra voucher entry',       enabled: true },
  { id: 'voucher.payment',    label: 'Payment Voucher',    keys: 'F5',     category: 'Vouchers',  description: 'Open Payment voucher entry',      enabled: true },
  { id: 'voucher.receipt',    label: 'Receipt Voucher',    keys: 'F6',     category: 'Vouchers',  description: 'Open Receipt voucher entry',      enabled: true },
  { id: 'voucher.journal',    label: 'Journal Voucher',    keys: 'F7',     category: 'Vouchers',  description: 'Open Journal voucher entry',      enabled: true },
  { id: 'voucher.sales',      label: 'Sales Voucher',      keys: 'F8',     category: 'Vouchers',  description: 'Open Sales voucher entry',        enabled: true },
  { id: 'voucher.purchase',   label: 'Purchase Voucher',   keys: 'F9',     category: 'Vouchers',  description: 'Open Purchase voucher entry',     enabled: true },

  // Master creation shortcuts
  { id: 'master.create',      label: 'Create Master',      keys: 'Alt+C',  category: 'Masters',   description: 'Create a new master record',      enabled: true },
  { id: 'master.alter',       label: 'Alter Master',       keys: 'Alt+A',  category: 'Masters',   description: 'Alter an existing master record', enabled: true },
  { id: 'master.display',     label: 'Display Master',     keys: 'Alt+D',  category: 'Masters',   description: 'Display master details',          enabled: true },

  // Action shortcuts
  { id: 'action.save',        label: 'Save',               keys: 'Ctrl+A', category: 'Actions',   description: 'Save current entry',              enabled: true },
  { id: 'action.delete',      label: 'Delete',             keys: 'Alt+D',  category: 'Actions',   description: 'Delete current entry',            enabled: true },
  { id: 'action.print',       label: 'Print',              keys: 'Alt+P',  category: 'Actions',   description: 'Print current view',              enabled: true },
  { id: 'action.export',      label: 'Export',             keys: 'Alt+E',  category: 'Actions',   description: 'Export current data',             enabled: true },

  // Navigation shortcuts
  { id: 'nav.commandPalette', label: 'Command Palette',    keys: 'Ctrl+K', category: 'Navigation', description: 'Open the Command Palette',       enabled: true },
  { id: 'nav.escape',         label: 'Close / Go Back',    keys: 'Escape', category: 'Navigation', description: 'Close dialog or go back',        enabled: true },

  // Report shortcuts
  { id: 'report.daybook',     label: 'Day Book',           keys: 'Alt+F2', category: 'Reports',   description: 'Open Day Book report',            enabled: true },
  { id: 'report.trialBalance',label: 'Trial Balance',      keys: 'Alt+F3', category: 'Reports',   description: 'Open Trial Balance report',       enabled: true },
  { id: 'report.profitLoss',  label: 'Profit & Loss',      keys: 'Alt+F5', category: 'Reports',   description: 'Open Profit & Loss report',       enabled: true },
  { id: 'report.balanceSheet',label: 'Balance Sheet',      keys: 'Alt+F7', category: 'Reports',   description: 'Open Balance Sheet report',       enabled: true },
];

/**
 * KeyBindingRegistryService — a configurable mapping layer for all shortcuts.
 *
 * Provides a centralized registry of keyboard shortcuts that can be queried,
 * customized, and extended at runtime. Pre-loaded with Tally-compatible defaults.
 */
@Injectable({ providedIn: 'root' })
export class KeyBindingRegistryService {

  private readonly bindingsMap = signal<Map<string, KeyBinding>>(new Map());

  /** All registered key bindings as a readonly signal. */
  readonly bindings = computed(() => Array.from(this.bindingsMap().values()));

  /** Bindings grouped by category. */
  readonly bindingsByCategory = computed(() => {
    const map = new Map<string, KeyBinding[]>();
    for (const binding of this.bindings()) {
      const cat = binding.category ?? 'General';
      const list = map.get(cat) ?? [];
      list.push(binding);
      map.set(cat, list);
    }
    return map;
  });

  constructor() {
    this.loadDefaults();
  }

  /** Load (or reset to) the default Tally-compatible shortcuts. */
  loadDefaults(): void {
    const map = new Map<string, KeyBinding>();
    for (const binding of TALLY_DEFAULTS) {
      map.set(binding.id, { ...binding });
    }
    this.bindingsMap.set(map);
  }

  /** Register or overwrite a single key binding. */
  register(binding: KeyBinding): void {
    this.bindingsMap.update(map => {
      const next = new Map(map);
      next.set(binding.id, { ...binding });
      return next;
    });
  }

  /** Register multiple key bindings at once. */
  registerAll(bindings: KeyBinding[]): void {
    this.bindingsMap.update(map => {
      const next = new Map(map);
      for (const b of bindings) {
        next.set(b.id, { ...b });
      }
      return next;
    });
  }

  /** Unregister a key binding by id. */
  unregister(id: string): void {
    this.bindingsMap.update(map => {
      const next = new Map(map);
      next.delete(id);
      return next;
    });
  }

  /** Get a specific binding by id. */
  getBinding(id: string): KeyBinding | undefined {
    return this.bindingsMap().get(id);
  }

  /** Enable or disable a specific binding. */
  setEnabled(id: string, enabled: boolean): void {
    this.bindingsMap.update(map => {
      const existing = map.get(id);
      if (!existing) return map;
      const next = new Map(map);
      next.set(id, { ...existing, enabled });
      return next;
    });
  }

  /** Update the key combination for a binding (user customization). */
  rebind(id: string, newKeys: string): void {
    this.bindingsMap.update(map => {
      const existing = map.get(id);
      if (!existing) return map;
      const next = new Map(map);
      next.set(id, { ...existing, keys: newKeys });
      return next;
    });
  }

  /**
   * Find the binding that matches the given keyboard event.
   * Returns the first enabled binding whose key combo matches.
   */
  findMatchingBinding(event: KeyboardEvent): KeyBinding | undefined {
    for (const binding of this.bindings()) {
      if (!binding.enabled) continue;
      if (this.matchesEvent(binding.keys, event)) {
        return binding;
      }
    }
    return undefined;
  }

  /** Parse a key string like 'Ctrl+K' into a structured ParsedKeyCombo. */
  parseKeyCombo(keys: string): ParsedKeyCombo {
    const parts = keys.split('+').map(p => p.trim());
    return {
      ctrl: parts.includes('Ctrl'),
      alt: parts.includes('Alt'),
      shift: parts.includes('Shift'),
      meta: parts.includes('Meta'),
      key: parts.filter(p => !['Ctrl', 'Alt', 'Shift', 'Meta'].includes(p))[0] ?? '',
    };
  }

  /** Check whether a key combo string matches a KeyboardEvent. */
  private matchesEvent(keys: string, event: KeyboardEvent): boolean {
    const combo = this.parseKeyCombo(keys);

    if (combo.ctrl !== (event.ctrlKey || event.metaKey)) return false;
    if (combo.alt !== event.altKey) return false;
    if (combo.shift !== event.shiftKey) return false;

    // Normalise the key comparison
    const eventKey = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    const comboKey = combo.key.length === 1 ? combo.key.toUpperCase() : combo.key;

    return eventKey === comboKey;
  }
}
