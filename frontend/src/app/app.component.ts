import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

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
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);

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
