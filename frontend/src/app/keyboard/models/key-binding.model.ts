/**
 * Represents a keyboard shortcut binding.
 */
export interface KeyBinding {
  /** Unique identifier for this binding, e.g. 'voucher.contra' */
  id: string;

  /** Human-readable label shown in the Command Palette */
  label: string;

  /** Key combination string, e.g. 'F4', 'Alt+C', 'Ctrl+K' */
  keys: string;

  /** Optional category for grouping in the palette */
  category?: string;

  /** Optional description for accessibility / help */
  description?: string;

  /** Whether the binding is currently active */
  enabled: boolean;
}

/**
 * Represents a command that can be executed via keyboard or the Command Palette.
 */
export interface Command {
  /** Unique identifier matching a KeyBinding id */
  id: string;

  /** Human-readable label */
  label: string;

  /** Optional category for grouping */
  category?: string;

  /** Optional description */
  description?: string;

  /** The action to execute */
  action: () => void;

  /** Optional icon identifier */
  icon?: string;

  /** Search keywords for the Command Palette */
  keywords?: string[];
}

/**
 * Contextual key mapping that adapts based on the active screen.
 */
export interface ContextualKeyMap {
  /** Context identifier, e.g. 'reports', 'voucher-entry', 'ledger' */
  contextId: string;

  /** Human-readable context name */
  contextLabel: string;

  /** Key bindings specific to this context */
  bindings: KeyBinding[];
}

/**
 * Modifier keys used in key combinations.
 */
export type ModifierKey = 'Ctrl' | 'Alt' | 'Shift' | 'Meta';

/**
 * Parsed representation of a key combination.
 */
export interface ParsedKeyCombo {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
}
