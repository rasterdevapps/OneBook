import { Directive, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { KeyboardNavigationService } from '../services/keyboard-navigation.service';
import { ContextualKeyMap } from '../models';

/**
 * KeyboardContextDirective — marks an element as a keyboard context zone.
 *
 * When the element is active (focused or entered), it sets the keyboard
 * context so that contextual power keys adapt to the active screen.
 *
 * Usage:
 *   <section appKeyboardContext="reports" [contextMap]="reportsKeyMap">
 *     ...
 *   </section>
 */
@Directive({
  selector: '[appKeyboardContext]',
  standalone: true,
  host: {
    '(focusin)': 'activate()',
    '(mouseenter)': 'activate()',
    '(focusout)': 'deactivate()',
    '(mouseleave)': 'deactivate()',
    '[attr.data-keyboard-context]': 'contextId',
    'role': 'region',
    '[attr.aria-label]': 'ariaLabel',
  }
})
export class KeyboardContextDirective implements OnInit, OnDestroy {

  private readonly navService = inject(KeyboardNavigationService);

  /** The context identifier, e.g. 'reports', 'voucher-entry', 'ledger'. */
  @Input('appKeyboardContext') contextId!: string;

  /** The contextual key map for this context zone. */
  @Input() contextMap?: ContextualKeyMap;

  /** Optional ARIA label for accessibility. */
  @Input() ariaLabel?: string;

  ngOnInit(): void {
    if (this.contextMap) {
      this.navService.registerContextMap(this.contextMap);
    }
  }

  ngOnDestroy(): void {
    if (this.contextId) {
      this.navService.unregisterContextMap(this.contextId);
      // Clear context if it was active
      if (this.navService.activeContext() === this.contextId) {
        this.navService.setContext(null);
      }
    }
  }

  activate(): void {
    this.navService.setContext(this.contextId);
  }

  deactivate(): void {
    if (this.navService.activeContext() === this.contextId) {
      this.navService.setContext(null);
    }
  }
}
