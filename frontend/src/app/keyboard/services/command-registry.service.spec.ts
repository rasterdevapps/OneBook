import { TestBed } from '@angular/core/testing';
import { CommandRegistryService } from './command-registry.service';
import { Command } from '../models';

describe('CommandRegistryService', () => {
  let service: CommandRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommandRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no commands', () => {
    expect(service.commands().length).toBe(0);
  });

  describe('register', () => {
    it('should register a command', () => {
      const cmd: Command = {
        id: 'test.cmd',
        label: 'Test Command',
        action: () => {},
      };
      service.register(cmd);
      expect(service.getCommand('test.cmd')).toBeTruthy();
      expect(service.getCommand('test.cmd')!.label).toBe('Test Command');
    });

    it('should overwrite an existing command with the same id', () => {
      service.register({ id: 'x', label: 'A', action: () => {} });
      service.register({ id: 'x', label: 'B', action: () => {} });
      expect(service.getCommand('x')!.label).toBe('B');
      expect(service.commands().length).toBe(1);
    });
  });

  describe('registerAll', () => {
    it('should register multiple commands', () => {
      service.registerAll([
        { id: 'a', label: 'A', action: () => {} },
        { id: 'b', label: 'B', action: () => {} },
      ]);
      expect(service.commands().length).toBe(2);
    });
  });

  describe('unregister', () => {
    it('should remove a command by id', () => {
      service.register({ id: 'rm', label: 'Remove Me', action: () => {} });
      expect(service.getCommand('rm')).toBeTruthy();
      service.unregister('rm');
      expect(service.getCommand('rm')).toBeUndefined();
    });
  });

  describe('execute', () => {
    it('should execute a command and return true', () => {
      let executed = false;
      service.register({ id: 'exec', label: 'Exec', action: () => { executed = true; } });
      const result = service.execute('exec');
      expect(result).toBeTrue();
      expect(executed).toBeTrue();
    });

    it('should return false for non-existent command', () => {
      const result = service.execute('nonexistent');
      expect(result).toBeFalse();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      service.registerAll([
        { id: 'inv.new', label: 'New Invoice', category: 'Vouchers', keywords: ['billing', 'sales'], action: () => {} },
        { id: 'led.open', label: 'Open Ledger', category: 'Reports', description: 'Open the pharmacy ledger', action: () => {} },
        { id: 'stk.show', label: 'Show Stock', category: 'Inventory', action: () => {} },
      ]);
    });

    it('should return all commands for empty query', () => {
      expect(service.search('').length).toBe(3);
    });

    it('should match by label', () => {
      const results = service.search('invoice');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('inv.new');
    });

    it('should match by category', () => {
      const results = service.search('reports');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('led.open');
    });

    it('should match by description', () => {
      const results = service.search('pharmacy');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('led.open');
    });

    it('should match by keywords', () => {
      const results = service.search('billing');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('inv.new');
    });

    it('should be case-insensitive', () => {
      const results = service.search('STOCK');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('stk.show');
    });

    it('should return empty for non-matching query', () => {
      const results = service.search('zzzzz');
      expect(results.length).toBe(0);
    });
  });
});
