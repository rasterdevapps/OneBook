import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommandPaletteComponent } from './keyboard/components/command-palette/command-palette.component';
import { KeyboardNavigationService } from './keyboard/services/keyboard-navigation.service';
import { CommandBootstrapService } from './keyboard/services/command-bootstrap.service';
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommandPaletteComponent, LanguageSwitcherComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  private keyboardNav = inject(KeyboardNavigationService);
  private commandBootstrap = inject(CommandBootstrapService);

  title = signal('OneBook');
  backendStatus = signal('Checking...');
  threadInfo = signal('');
  postgresqlStatus = signal('Checking...');
  redisStatus = signal('Checking...');
  sidebarCollapsed = signal(false);

  statusMessage = computed(() =>
    `${this.title()} — Backend: ${this.backendStatus()}`
  );

  statusClass = computed(() =>
    this.backendStatus() === 'UP' ? 'online' : 'offline'
  );

  ngOnInit(): void {
    this.commandBootstrap.bootstrap();

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
          this.backendStatus.set('Offline');
          this.postgresqlStatus.set('Offline');
          this.redisStatus.set('Offline');
        }
      });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
