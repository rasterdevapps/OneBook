import { Component, inject } from '@angular/core';
import { TranslocoService, TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslocoDirective],
  template: `
    <div class="language-switcher" *transloco="let t">
      <label>{{ t('common.language') }}:</label>
      <select (change)="switchLanguage($event)">
        <option value="en" [selected]="currentLang === 'en'">English</option>
        <option value="hi" [selected]="currentLang === 'hi'">हिन्दी</option>
      </select>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
    }
    select {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
      font-size: 14px;
    }
  `]
})
export class LanguageSwitcherComponent {
  private translocoService = inject(TranslocoService);

  get currentLang(): string {
    return this.translocoService.getActiveLang();
  }

  switchLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.translocoService.setActiveLang(target.value);
  }
}
