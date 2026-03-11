import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommandPaletteComponent } from './keyboard/components/command-palette/command-palette.component';
import { KeyboardNavigationService } from './keyboard/services/keyboard-navigation.service';
import { LanguageSwitcherComponent } from './i18n/components/language-switcher/language-switcher.component';

interface HealthResponse {
  status: string;
  service: string;
  thread: string;
  components: {
    postgresql: string;
    redis: string;
  };
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommandPaletteComponent, LanguageSwitcherComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);

  // Inject to eagerly initialize the global keyboard listener
  private keyboardNav = inject(KeyboardNavigationService);

  title = signal('OneBook');
  backendStatus = signal('Checking...');
  threadInfo = signal('');
  postgresqlStatus = signal('Checking...');
  redisStatus = signal('Checking...');

  statusMessage = computed(() =>
    `${this.title()} — Backend: ${this.backendStatus()}`
  );

  ngOnInit(): void {
    this.http.get<HealthResponse>('/api/health')
      .subscribe({
        next: (res) => {
          this.backendStatus.set(res.status);
          this.threadInfo.set(res.thread);
          if (res.components) {
            this.postgresqlStatus.set(res.components.postgresql);
            this.redisStatus.set(res.components.redis);
          }
        },
        error: () => {
          this.backendStatus.set('Unavailable');
          this.postgresqlStatus.set('Unavailable');
          this.redisStatus.set('Unavailable');
        }
      });
  }
}
