export interface AuditSampleRequest {
  id: number;
  tenantId: string;
  auditorName: string;
  auditorEmail: string;
  requestDescription: string;
  tableName: string;
  sampleSize: number;
  dateFrom?: string;
  dateTo?: string;
  status: string;
  responseData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditComment {
  id: number;
  tenantId: string;
  auditorName: string;
  tableName: string;
  recordId: number;
  commentText: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditWorkflow {
  id: number;
  tenantId: string;
  workflowName: string;
  description?: string;
  auditorName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAuditReport {
  tenantId: string;
  auditTimestamp: string;
  encryptionVerified: boolean;
  keyManagementVerified: boolean;
  auditChainIntact: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  findings: string[];
}
