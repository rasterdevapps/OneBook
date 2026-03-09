import { TestBed } from '@angular/core/testing';
import { KeyboardNavigationService } from './keyboard-navigation.service';
import { KeyBindingRegistryService } from './key-binding-registry.service';
import { CommandRegistryService } from './command-registry.service';

describe('KeyboardNavigationService', () => {
  let service: KeyboardNavigationService;
  let commands: CommandRegistryService;
  let registry: KeyBindingRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardNavigationService);
    commands = TestBed.inject(CommandRegistryService);
    registry = TestBed.inject(KeyBindingRegistryService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null active context', () => {
    expect(service.activeContext()).toBeNull();
  });

  it('should start enabled', () => {
    expect(service.enabled()).toBeTrue();
  });

  describe('setContext', () => {
    it('should set the active context', () => {
      service.setContext('reports');
      expect(service.activeContext()).toBe('reports');
    });

    it('should clear context with null', () => {
      service.setContext('reports');
      service.setContext(null);
      expect(service.activeContext()).toBeNull();
    });
  });

  describe('contextual key maps', () => {
    it('should register and retrieve a context map', () => {
      service.registerContextMap({
        contextId: 'reports',
        contextLabel: 'Reports',
        bindings: [
          { id: 'reports.drilldown', label: 'Drill Down', keys: 'Enter', enabled: true },
        ],
      });
      const map = service.getContextMap('reports');
      expect(map).toBeTruthy();
      expect(map!.bindings.length).toBe(1);
    });

    it('should unregister a context map', () => {
      service.registerContextMap({
        contextId: 'test',
        contextLabel: 'Test',
        bindings: [],
      });
      service.unregisterContextMap('test');
      expect(service.getContextMap('test')).toBeUndefined();
    });

    it('should return active context bindings when context is set', () => {
      service.registerContextMap({
        contextId: 'ledger',
        contextLabel: 'Ledger',
        bindings: [
          { id: 'ledger.filter', label: 'Filter', keys: '/', enabled: true },
          { id: 'ledger.addCol', label: 'Add Column', keys: '+', enabled: true },
        ],
      });
      service.setContext('ledger');
      expect(service.activeContextBindings().length).toBe(2);
    });

    it('should return empty bindings when no context is set', () => {
      expect(service.activeContextBindings().length).toBe(0);
    });
  });

  describe('handleKeyEvent', () => {
    it('should execute a matching global command', () => {
      let called = false;
      commands.register({ id: 'voucher.contra', label: 'Contra', action: () => { called = true; } });

      const event = new KeyboardEvent('keydown', { key: 'F4', cancelable: true });
      service.handleKeyEvent(event);

      expect(called).toBeTrue();
    });

    it('should not execute when disabled', () => {
      let called = false;
      commands.register({ id: 'voucher.contra', label: 'Contra', action: () => { called = true; } });

      service.enabled.set(false);
      const event = new KeyboardEvent('keydown', { key: 'F4', cancelable: true });
      service.handleKeyEvent(event);

      expect(called).toBeFalse();
    });

    it('should update lastTriggered signal', () => {
      commands.register({ id: 'voucher.contra', label: 'Contra', action: () => {} });

      const event = new KeyboardEvent('keydown', { key: 'F4', cancelable: true });
      service.handleKeyEvent(event);

      expect(service.lastTriggered()).toBe('voucher.contra');
    });

    it('should prioritize contextual bindings over global bindings', () => {
      let globalCalled = false;
      let contextualCalled = false;

      // Register a global command for Enter
      registry.register({ id: 'global.enter', label: 'Global Enter', keys: 'Enter', enabled: true });
      commands.register({ id: 'global.enter', label: 'Global Enter', action: () => { globalCalled = true; } });

      // Register a contextual binding for Enter
      service.registerContextMap({
        contextId: 'reports',
        contextLabel: 'Reports',
        bindings: [
          { id: 'reports.drilldown', label: 'Drill Down', keys: 'Enter', enabled: true },
        ],
      });
      commands.register({ id: 'reports.drilldown', label: 'Drill Down', action: () => { contextualCalled = true; } });

      service.setContext('reports');
      const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
      service.handleKeyEvent(event);

      expect(contextualCalled).toBeTrue();
      expect(globalCalled).toBeFalse();
    });
  });
});
