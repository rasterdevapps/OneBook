import { TestBed } from '@angular/core/testing';
import { KeyBindingRegistryService } from './key-binding-registry.service';

describe('KeyBindingRegistryService', () => {
  let service: KeyBindingRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyBindingRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('default bindings', () => {
    it('should pre-load Tally-compatible default bindings', () => {
      const bindings = service.bindings();
      expect(bindings.length).toBeGreaterThan(0);
    });

    it('should include F4 Contra voucher shortcut', () => {
      const binding = service.getBinding('voucher.contra');
      expect(binding).toBeTruthy();
      expect(binding!.keys).toBe('F4');
      expect(binding!.label).toBe('Contra Voucher');
      expect(binding!.category).toBe('Vouchers');
    });

    it('should include F5 Payment voucher shortcut', () => {
      const binding = service.getBinding('voucher.payment');
      expect(binding).toBeTruthy();
      expect(binding!.keys).toBe('F5');
    });

    it('should include F7 Journal voucher shortcut', () => {
      const binding = service.getBinding('voucher.journal');
      expect(binding).toBeTruthy();
      expect(binding!.keys).toBe('F7');
    });

    it('should include Alt+C Create Master shortcut', () => {
      const binding = service.getBinding('master.create');
      expect(binding).toBeTruthy();
      expect(binding!.keys).toBe('Alt+C');
    });

    it('should include Ctrl+A Save shortcut', () => {
      const binding = service.getBinding('action.save');
      expect(binding).toBeTruthy();
      expect(binding!.keys).toBe('Ctrl+A');
    });

    it('should include Ctrl+K Command Palette shortcut', () => {
      const binding = service.getBinding('nav.commandPalette');
      expect(binding).toBeTruthy();
      expect(binding!.keys).toBe('Ctrl+K');
    });

    it('should group bindings by category', () => {
      const grouped = service.bindingsByCategory();
      expect(grouped.has('Vouchers')).toBeTrue();
      expect(grouped.has('Masters')).toBeTrue();
      expect(grouped.has('Actions')).toBeTrue();
      expect(grouped.has('Navigation')).toBeTrue();
      expect(grouped.has('Reports')).toBeTrue();
    });
  });

  describe('register', () => {
    it('should register a new key binding', () => {
      service.register({
        id: 'custom.test',
        label: 'Test Shortcut',
        keys: 'Ctrl+T',
        enabled: true,
      });
      const binding = service.getBinding('custom.test');
      expect(binding).toBeTruthy();
      expect(binding!.keys).toBe('Ctrl+T');
    });

    it('should overwrite an existing binding', () => {
      service.register({
        id: 'voucher.contra',
        label: 'Modified Contra',
        keys: 'F10',
        enabled: true,
      });
      const binding = service.getBinding('voucher.contra');
      expect(binding!.label).toBe('Modified Contra');
      expect(binding!.keys).toBe('F10');
    });
  });

  describe('registerAll', () => {
    it('should register multiple bindings at once', () => {
      service.registerAll([
        { id: 'batch.one', label: 'One', keys: 'Alt+1', enabled: true },
        { id: 'batch.two', label: 'Two', keys: 'Alt+2', enabled: true },
      ]);
      expect(service.getBinding('batch.one')).toBeTruthy();
      expect(service.getBinding('batch.two')).toBeTruthy();
    });
  });

  describe('unregister', () => {
    it('should remove a binding by id', () => {
      expect(service.getBinding('voucher.contra')).toBeTruthy();
      service.unregister('voucher.contra');
      expect(service.getBinding('voucher.contra')).toBeUndefined();
    });
  });

  describe('setEnabled', () => {
    it('should disable a binding', () => {
      service.setEnabled('voucher.contra', false);
      expect(service.getBinding('voucher.contra')!.enabled).toBeFalse();
    });

    it('should enable a disabled binding', () => {
      service.setEnabled('voucher.contra', false);
      service.setEnabled('voucher.contra', true);
      expect(service.getBinding('voucher.contra')!.enabled).toBeTrue();
    });

    it('should no-op for non-existent binding', () => {
      const before = service.bindings().length;
      service.setEnabled('nonexistent', true);
      expect(service.bindings().length).toBe(before);
    });
  });

  describe('rebind', () => {
    it('should change the key combination', () => {
      service.rebind('voucher.contra', 'Ctrl+F4');
      expect(service.getBinding('voucher.contra')!.keys).toBe('Ctrl+F4');
    });

    it('should no-op for non-existent binding', () => {
      const before = service.bindings().length;
      service.rebind('nonexistent', 'Ctrl+X');
      expect(service.bindings().length).toBe(before);
    });
  });

  describe('loadDefaults', () => {
    it('should reset bindings to defaults', () => {
      service.unregister('voucher.contra');
      expect(service.getBinding('voucher.contra')).toBeUndefined();
      service.loadDefaults();
      expect(service.getBinding('voucher.contra')).toBeTruthy();
      expect(service.getBinding('voucher.contra')!.keys).toBe('F4');
    });
  });

  describe('parseKeyCombo', () => {
    it('should parse a single key', () => {
      const combo = service.parseKeyCombo('F4');
      expect(combo.key).toBe('F4');
      expect(combo.ctrl).toBeFalse();
      expect(combo.alt).toBeFalse();
      expect(combo.shift).toBeFalse();
      expect(combo.meta).toBeFalse();
    });

    it('should parse Ctrl+Key', () => {
      const combo = service.parseKeyCombo('Ctrl+K');
      expect(combo.key).toBe('K');
      expect(combo.ctrl).toBeTrue();
      expect(combo.alt).toBeFalse();
    });

    it('should parse Alt+Key', () => {
      const combo = service.parseKeyCombo('Alt+C');
      expect(combo.key).toBe('C');
      expect(combo.alt).toBeTrue();
      expect(combo.ctrl).toBeFalse();
    });

    it('should parse compound Ctrl+Shift+Key', () => {
      const combo = service.parseKeyCombo('Ctrl+Shift+P');
      expect(combo.key).toBe('P');
      expect(combo.ctrl).toBeTrue();
      expect(combo.shift).toBeTrue();
    });
  });

  describe('findMatchingBinding', () => {
    it('should match an F4 key event to voucher.contra', () => {
      const event = new KeyboardEvent('keydown', { key: 'F4' });
      const matched = service.findMatchingBinding(event);
      expect(matched).toBeTruthy();
      expect(matched!.id).toBe('voucher.contra');
    });

    it('should match Ctrl+K to command palette', () => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      const matched = service.findMatchingBinding(event);
      expect(matched).toBeTruthy();
      expect(matched!.id).toBe('nav.commandPalette');
    });

    it('should match Alt+C to create master', () => {
      const event = new KeyboardEvent('keydown', { key: 'c', altKey: true });
      const matched = service.findMatchingBinding(event);
      expect(matched).toBeTruthy();
      expect(matched!.id).toBe('master.create');
    });

    it('should not match disabled bindings', () => {
      service.setEnabled('voucher.contra', false);
      const event = new KeyboardEvent('keydown', { key: 'F4' });
      const matched = service.findMatchingBinding(event);
      expect(matched?.id).not.toBe('voucher.contra');
    });

    it('should return undefined for unregistered key combos', () => {
      const event = new KeyboardEvent('keydown', { key: 'F12' });
      const matched = service.findMatchingBinding(event);
      expect(matched).toBeUndefined();
    });
  });
});
