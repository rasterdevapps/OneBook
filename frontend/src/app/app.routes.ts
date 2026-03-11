import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'ai', loadComponent: () => import('./ai/components/ai-dashboard/ai-dashboard.component').then(m => m.AiDashboardComponent) }
];
