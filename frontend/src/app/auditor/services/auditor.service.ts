import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuditSampleRequest,
  AuditComment,
  AuditWorkflow,
  SecurityAuditReport
} from '../models/auditor.models';

@Injectable({ providedIn: 'root' })
export class AuditorService {
  private readonly http = inject(HttpClient);

  // --- Sample Requests ---

  getSampleRequests(tenantId: string): Observable<AuditSampleRequest[]> {
    return this.http.get<AuditSampleRequest[]>(
      `/api/auditor-portal/sample-requests?tenantId=${tenantId}`);
  }

  createSampleRequest(request: Partial<AuditSampleRequest>): Observable<AuditSampleRequest> {
    return this.http.post<AuditSampleRequest>(
      '/api/auditor-portal/sample-requests', request);
  }

  // --- Comments ---

  getComments(tenantId: string): Observable<AuditComment[]> {
    return this.http.get<AuditComment[]>(
      `/api/auditor-portal/comments?tenantId=${tenantId}`);
  }

  createComment(comment: Partial<AuditComment>): Observable<AuditComment> {
    return this.http.post<AuditComment>(
      '/api/auditor-portal/comments', comment);
  }

  resolveComment(id: number): Observable<AuditComment> {
    return this.http.post<AuditComment>(
      `/api/auditor-portal/comments/${id}/resolve`, {});
  }

  // --- Workflows ---

  getWorkflows(tenantId: string): Observable<AuditWorkflow[]> {
    return this.http.get<AuditWorkflow[]>(
      `/api/auditor-portal/workflows?tenantId=${tenantId}`);
  }

  createWorkflow(workflow: Partial<AuditWorkflow>): Observable<AuditWorkflow> {
    return this.http.post<AuditWorkflow>(
      '/api/auditor-portal/workflows', workflow);
  }

  approveWorkflow(id: number): Observable<AuditWorkflow> {
    return this.http.post<AuditWorkflow>(
      `/api/auditor-portal/workflows/${id}/approve`, {});
  }

  rejectWorkflow(id: number, reason: string): Observable<AuditWorkflow> {
    return this.http.post<AuditWorkflow>(
      `/api/auditor-portal/workflows/${id}/reject`, reason);
  }

  // --- Security Audit ---

  runSecurityAudit(tenantId: string): Observable<SecurityAuditReport> {
    return this.http.get<SecurityAuditReport>(
      `/api/security-audit/run?tenantId=${tenantId}`);
  }
}
