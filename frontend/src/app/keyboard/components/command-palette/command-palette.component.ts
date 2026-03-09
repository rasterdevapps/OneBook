import {
  Component, signal, computed, inject, OnInit, OnDestroy,
  ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommandRegistryService } from '../../services/command-registry.service';
import { KeyBindingRegistryService } from '../../services/key-binding-registry.service';
import { Command } from '../../models';

/**
 * CommandPaletteComponent — a global Omni-Search overlay activated by Ctrl+K / Cmd+K.
 *
 * Provides fuzzy search across all registered commands, grouped by category,
 * with full keyboard navigation (↑/↓ arrows, Enter to execute, Escape to close).
 */
@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="palette-backdrop"
           (click)="close()"
           role="presentation">
      </div>
      <div class="palette-container"
           role="dialog"
           aria-modal="true"
           aria-label="Command Palette">
        <div class="palette-header">
          <label for="palette-search" class="sr-only">Search commands</label>
          <input #searchInput
                 id="palette-search"
                 type="text"
                 class="palette-search"
                 [value]="query()"
                 (input)="onSearch($event)"
                 (keydown)="onKeydown($event)"
                 placeholder="Type a command..."
                 autocomplete="off"
                 role="combobox"
                 aria-expanded="true"
                 aria-controls="palette-results"
                 [attr.aria-activedescendant]="activeDescendantId()" />
        </div>
        <ul id="palette-results"
            class="palette-results"
            role="listbox"
            aria-label="Command results">
          @for (cmd of filteredCommands(); track cmd.id; let i = $index) {
            <li [id]="'palette-item-' + cmd.id"
                class="palette-item"
                [class.active]="i === selectedIndex()"
                role="option"
                [attr.aria-selected]="i === selectedIndex()"
                (click)="executeCommand(cmd)"
                (mouseenter)="selectedIndex.set(i)">
              <span class="palette-item-label">{{ cmd.label }}</span>
              @if (cmd.category) {
                <span class="palette-item-category">{{ cmd.category }}</span>
              }
              @if (getShortcut(cmd.id); as shortcut) {
                <kbd class="palette-item-shortcut">{{ shortcut }}</kbd>
              }
            </li>
          }
          @if (filteredCommands().length === 0) {
            <li class="palette-empty" role="option" aria-disabled="true">
              No matching commands
            </li>
          }
        </ul>
        <div class="palette-footer" aria-hidden="true">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Execute</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .palette-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
    }

    .palette-container {
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 560px;
      max-height: 60vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .palette-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .palette-search {
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      outline: none;
      box-sizing: border-box;
    }

    .palette-search:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .palette-results {
      list-style: none;
      margin: 0;
      padding: 8px 0;
      overflow-y: auto;
      max-height: 40vh;
    }

    .palette-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      cursor: pointer;
      gap: 12px;
    }

    .palette-item.active {
      background: #eff6ff;
    }

    .palette-item-label {
      flex: 1;
      font-size: 14px;
      color: #1f2937;
    }

    .palette-item-category {
      font-size: 12px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .palette-item-shortcut {
      font-size: 12px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      border: 1px solid #e5e7eb;
    }

    .palette-empty {
      padding: 16px;
      text-align: center;
      color: #9ca3af;
      font-size: 14px;
    }

    .palette-footer {
      display: flex;
      gap: 16px;
      padding: 8px 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
    }

    .palette-footer kbd {
      background: #f3f4f6;
      padding: 1px 4px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 11px;
      border: 1px solid #e5e7eb;
    }
  `]
})
export class CommandPaletteComponent implements OnInit, OnDestroy {

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  private readonly commandRegistry = inject(CommandRegistryService);
  private readonly bindingRegistry = inject(KeyBindingRegistryService);

  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly selectedIndex = signal(0);

  readonly filteredCommands = computed(() =>
    this.commandRegistry.search(this.query())
  );

  readonly activeDescendantId = computed(() => {
    const cmds = this.filteredCommands();
    const idx = this.selectedIndex();
    if (idx >= 0 && idx < cmds.length) {
      return 'palette-item-' + cmds[idx].id;
    }
    return null;
  });

  private boundGlobalHandler!: (e: KeyboardEvent) => void;

  ngOnInit(): void {
    this.boundGlobalHandler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'K') {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen()) {
        e.preventDefault();
        this.close();
      }
    };
    document.addEventListener('keydown', this.boundGlobalHandler, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.boundGlobalHandler, true);
  }

  /** Toggle the palette open/closed. */
  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Open the palette and focus the search input. */
  open(): void {
    this.isOpen.set(true);
    this.query.set('');
    this.selectedIndex.set(0);
    // Focus after the DOM updates
    setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 0);
  }

  /** Close the palette. */
  close(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.selectedIndex.set(0);
  }

  /** Handle search input changes. */
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.selectedIndex.set(0);
  }

  /** Handle keydown events within the search input for navigation. */
  onKeydown(event: KeyboardEvent): void {
    const cmds = this.filteredCommands();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update(i => Math.min(i + 1, cmds.length - 1));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update(i => Math.max(i - 1, 0));
        break;

      case 'Enter':
        event.preventDefault();
        if (cmds.length > 0) {
          const idx = this.selectedIndex();
          if (idx >= 0 && idx < cmds.length) {
            this.executeCommand(cmds[idx]);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  /** Execute a command and close the palette. */
  executeCommand(cmd: Command): void {
    this.close();
    this.commandRegistry.execute(cmd.id);
  }

  /** Get the keyboard shortcut for a command. */
  getShortcut(commandId: string): string | null {
    const binding = this.bindingRegistry.getBinding(commandId);
    return binding?.keys ?? null;
  }
}
