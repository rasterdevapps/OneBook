package com.nexus.onebook.ledger.controller;

import com.nexus.onebook.ledger.dto.SecurityAuditReport;
import com.nexus.onebook.ledger.service.SecurityAuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for security audit operations.
 * Provides endpoints for running security verification checks.
 */
@RestController
@RequestMapping("/api/security-audit")
public class SecurityAuditController {

    private final SecurityAuditService securityAuditService;

    public SecurityAuditController(SecurityAuditService securityAuditService) {
        this.securityAuditService = securityAuditService;
    }

    @GetMapping("/run")
    public ResponseEntity<SecurityAuditReport> runAudit(@RequestParam String tenantId) {
        return ResponseEntity.ok(securityAuditService.runSecurityAudit(tenantId));
    }
}
