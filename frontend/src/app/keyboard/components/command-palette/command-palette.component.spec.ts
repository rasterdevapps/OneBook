import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommandPaletteComponent } from './command-palette.component';
import { CommandRegistryService } from '../../services/command-registry.service';
import { KeyBindingRegistryService } from '../../services/key-binding-registry.service';

describe('CommandPaletteComponent', () => {
  let component: CommandPaletteComponent;
  let fixture: ComponentFixture<CommandPaletteComponent>;
  let commandRegistry: CommandRegistryService;
  let bindingRegistry: KeyBindingRegistryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandPaletteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandPaletteComponent);
    component = fixture.componentInstance;
    commandRegistry = TestBed.inject(CommandRegistryService);
    bindingRegistry = TestBed.inject(KeyBindingRegistryService);
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start closed', () => {
    expect(component.isOpen()).toBeFalse();
  });

  describe('open/close', () => {
    it('should open the palette', fakeAsync(() => {
      component.open();
      tick();
      fixture.detectChanges();
      expect(component.isOpen()).toBeTrue();
    }));

    it('should close the palette', () => {
      component.open();
      component.close();
      expect(component.isOpen()).toBeFalse();
    });

    it('should toggle the palette', fakeAsync(() => {
      component.toggle();
      tick();
      expect(component.isOpen()).toBeTrue();
      component.toggle();
      expect(component.isOpen()).toBeFalse();
    }));

    it('should reset query on open', fakeAsync(() => {
      component.query.set('old search');
      component.open();
      tick();
      expect(component.query()).toBe('');
    }));

    it('should reset selectedIndex on open', fakeAsync(() => {
      component.selectedIndex.set(5);
      component.open();
      tick();
      expect(component.selectedIndex()).toBe(0);
    }));
  });

  describe('search and filtering', () => {
    beforeEach(() => {
      commandRegistry.registerAll([
        { id: 'inv.new', label: 'New Invoice', category: 'Vouchers', action: () => {} },
        { id: 'led.open', label: 'Open Ledger', category: 'Reports', action: () => {} },
        { id: 'stk.show', label: 'Show Stock', category: 'Inventory', action: () => {} },
      ]);
    });

    it('should show all commands when query is empty', () => {
      component.query.set('');
      expect(component.filteredCommands().length).toBe(3);
    });

    it('should filter commands by query', () => {
      component.query.set('invoice');
      expect(component.filteredCommands().length).toBe(1);
      expect(component.filteredCommands()[0].id).toBe('inv.new');
    });

    it('should reset selectedIndex on search', () => {
      component.selectedIndex.set(2);
      const input = document.createElement('input');
      input.value = 'test';
      component.onSearch({ target: input } as unknown as Event);
      expect(component.selectedIndex()).toBe(0);
    });
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      commandRegistry.registerAll([
        { id: 'cmd1', label: 'Command 1', action: () => {} },
        { id: 'cmd2', label: 'Command 2', action: () => {} },
        { id: 'cmd3', label: 'Command 3', action: () => {} },
      ]);
      component.query.set('');
    });

    it('should move selection down with ArrowDown', () => {
      component.selectedIndex.set(0);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
      component.onKeydown(event);
      expect(component.selectedIndex()).toBe(1);
    });

    it('should not go past last item with ArrowDown', () => {
      component.selectedIndex.set(2);
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
      component.onKeydown(event);
      expect(component.selectedIndex()).toBe(2);
    });

    it('should move selection up with ArrowUp', () => {
      component.selectedIndex.set(2);
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
      component.onKeydown(event);
      expect(component.selectedIndex()).toBe(1);
    });

    it('should not go below 0 with ArrowUp', () => {
      component.selectedIndex.set(0);
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
      component.onKeydown(event);
      expect(component.selectedIndex()).toBe(0);
    });

    it('should execute selected command on Enter', () => {
      let executed = false;
      commandRegistry.register({ id: 'cmd1', label: 'Command 1', action: () => { executed = true; } });
      component.selectedIndex.set(0);
      component.query.set('');

      const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
      component.onKeydown(event);
      expect(executed).toBeTrue();
    });

    it('should close palette on Escape', fakeAsync(() => {
      component.open();
      tick();
      const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
      component.onKeydown(event);
      expect(component.isOpen()).toBeFalse();
    }));
  });

  describe('command execution', () => {
    it('should execute command and close palette', fakeAsync(() => {
      let executed = false;
      const cmd = { id: 'test', label: 'Test', action: () => { executed = true; } };
      commandRegistry.register(cmd);

      component.open();
      tick();
      component.executeCommand(cmd);

      expect(executed).toBeTrue();
      expect(component.isOpen()).toBeFalse();
    }));
  });

  describe('shortcut display', () => {
    it('should return shortcut key for a bound command', () => {
      expect(component.getShortcut('voucher.contra')).toBe('F4');
    });

    it('should return null for unbound command', () => {
      expect(component.getShortcut('nonexistent')).toBeNull();
    });
  });

  describe('ARIA accessibility', () => {
    beforeEach(fakeAsync(() => {
      commandRegistry.register({ id: 'acc.cmd', label: 'Accessible', action: () => {} });
      component.open();
      tick();
      fixture.detectChanges();
    }));

    it('should render with role="dialog"', () => {
      const container = fixture.nativeElement.querySelector('.palette-container');
      expect(container.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal="true"', () => {
      const container = fixture.nativeElement.querySelector('.palette-container');
      expect(container.getAttribute('aria-modal')).toBe('true');
    });

    it('should have role="combobox" on input', () => {
      const input = fixture.nativeElement.querySelector('.palette-search');
      expect(input.getAttribute('role')).toBe('combobox');
    });

    it('should have role="listbox" on results', () => {
      const list = fixture.nativeElement.querySelector('.palette-results');
      expect(list.getAttribute('role')).toBe('listbox');
    });

    it('should have role="option" on items', () => {
      const items = fixture.nativeElement.querySelectorAll('.palette-item');
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].getAttribute('role')).toBe('option');
    });

    it('should have aria-selected on the active item', () => {
      const items = fixture.nativeElement.querySelectorAll('.palette-item');
      expect(items[0].getAttribute('aria-selected')).toBe('true');
    });

    it('should have screen-reader-only label for search', () => {
      const label = fixture.nativeElement.querySelector('.sr-only');
      expect(label).toBeTruthy();
      expect(label.textContent).toContain('Search commands');
    });

    it('should compute activeDescendantId', () => {
      component.selectedIndex.set(0);
      expect(component.activeDescendantId()).toBe('palette-item-acc.cmd');
    });
  });

  describe('Ctrl+K global handler', () => {
    it('should open palette on Ctrl+K', fakeAsync(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        cancelable: true,
        bubbles: true
      });
      document.dispatchEvent(event);
      tick();
      expect(component.isOpen()).toBeTrue();
    }));

    it('should close palette on Escape when open', fakeAsync(() => {
      component.open();
      tick();
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
        bubbles: true
      });
      document.dispatchEvent(event);
      expect(component.isOpen()).toBeFalse();
    }));
  });
});
