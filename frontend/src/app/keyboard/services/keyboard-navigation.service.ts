import { Injectable, signal, computed, OnDestroy, NgZone, inject } from '@angular/core';
import { KeyBindingRegistryService } from './key-binding-registry.service';
import { CommandRegistryService } from './command-registry.service';
import { ContextualKeyMap, KeyBinding } from '../models';

/**
 * KeyboardNavigationService — the global keyboard event listener and dispatcher.
 *
 * Listens for keyboard events at the document level, matches them against
 * registered key bindings (global + contextual), and dispatches the
 * corresponding commands.
 */
@Injectable({ providedIn: 'root' })
export class KeyboardNavigationService implements OnDestroy {

  private readonly registry = inject(KeyBindingRegistryService);
  private readonly commands = inject(CommandRegistryService);
  private readonly zone = inject(NgZone);

  /** The currently active context id (e.g. 'reports', 'voucher-entry'). */
  readonly activeContext = signal<string | null>(null);

  /** Contextual key maps registered for specific screens. */
  private readonly contextMaps = signal<Map<string, ContextualKeyMap>>(new Map());

  /** The active contextual bindings based on current context. */
  readonly activeContextBindings = computed<KeyBinding[]>(() => {
    const ctx = this.activeContext();
    if (!ctx) return [];
    return this.contextMaps().get(ctx)?.bindings ?? [];
  });

  /** Whether the keyboard navigation system is active. */
  readonly enabled = signal(true);

  /** Signal emitted when a binding is triggered (for UI feedback). */
  readonly lastTriggered = signal<string | null>(null);

  private readonly boundHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.boundHandler = (e: KeyboardEvent) => this.handleKeyEvent(e);
    this.zone.runOutsideAngular(() => {
      document.addEventListener('keydown', this.boundHandler, true);
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.boundHandler, true);
  }

  /** Set the active keyboard context. */
  setContext(contextId: string | null): void {
    this.activeContext.set(contextId);
  }

  /** Register a contextual key map for a specific screen/context. */
  registerContextMap(contextMap: ContextualKeyMap): void {
    this.contextMaps.update(map => {
      const next = new Map(map);
      next.set(contextMap.contextId, contextMap);
      return next;
    });
  }

  /** Unregister a contextual key map. */
  unregisterContextMap(contextId: string): void {
    this.contextMaps.update(map => {
      const next = new Map(map);
      next.delete(contextId);
      return next;
    });
  }

  /** Get a registered contextual key map. */
  getContextMap(contextId: string): ContextualKeyMap | undefined {
    return this.contextMaps().get(contextId);
  }

  /**
   * Handle a keyboard event: match against contextual bindings first,
   * then global bindings, and execute the corresponding command.
   */
  handleKeyEvent(event: KeyboardEvent): void {
    if (!this.enabled()) return;

    // Skip if user is typing in an input field (unless it's a global shortcut)
    const target = event.target as HTMLElement | null;
    const isInputField = target != null && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    );

    // First check contextual bindings
    let matched = this.findContextualMatch(event);

    // Then check global bindings
    if (!matched) {
      matched = this.registry.findMatchingBinding(event);
    }

    if (matched) {
      // Allow input-field typing unless it's a function key or has modifiers
      if (isInputField && !this.isGlobalShortcut(event)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      this.zone.run(() => {
        this.lastTriggered.set(matched!.id);
        this.commands.execute(matched!.id);
      });
    }
  }

  /** Check whether this is a global shortcut that should work even in input fields. */
  private isGlobalShortcut(event: KeyboardEvent): boolean {
    return event.key.startsWith('F') && event.key.length > 1 || // Function keys
           event.ctrlKey || event.metaKey || event.altKey;       // Modifier combos
  }

  /** Find a matching binding in the active contextual key map. */
  private findContextualMatch(event: KeyboardEvent): KeyBinding | undefined {
    for (const binding of this.activeContextBindings()) {
      if (!binding.enabled) continue;
      if (this.matchesEvent(binding.keys, event)) {
        return binding;
      }
    }
    return undefined;
  }

  /** Check whether a key combo string matches a KeyboardEvent. */
  private matchesEvent(keys: string, event: KeyboardEvent): boolean {
    const combo = this.registry.parseKeyCombo(keys);
    if (combo.ctrl !== (event.ctrlKey || event.metaKey)) return false;
    if (combo.alt !== event.altKey) return false;
    if (combo.shift !== event.shiftKey) return false;

    const eventKey = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    const comboKey = combo.key.length === 1 ? combo.key.toUpperCase() : combo.key;
    return eventKey === comboKey;
  }
}
