package com.nexus.onebook.ledger.service;

import com.nexus.onebook.ledger.dto.ConnectedPaymentRequest;
import com.nexus.onebook.ledger.model.*;
import com.nexus.onebook.ledger.repository.ConnectedPaymentRepository;
import com.nexus.onebook.ledger.repository.LedgerAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Connected Payments service — direct bank integration for payment initiation
 * via NEFT, RTGS, IMPS, or UPI from within the system.
 */
@Service
public class ConnectedPaymentService {

    private final ConnectedPaymentRepository paymentRepository;
    private final LedgerAccountRepository ledgerAccountRepository;

    public ConnectedPaymentService(ConnectedPaymentRepository paymentRepository,
                                    LedgerAccountRepository ledgerAccountRepository) {
        this.paymentRepository = paymentRepository;
        this.ledgerAccountRepository = ledgerAccountRepository;
    }

    @Transactional
    public ConnectedPayment initiatePayment(ConnectedPaymentRequest request) {
        LedgerAccount bankAccount = ledgerAccountRepository.findById(request.bankAccountId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Bank account not found: " + request.bankAccountId()));

        ConnectedPayment payment = new ConnectedPayment(
                request.tenantId(), bankAccount, request.beneficiaryName(),
                request.beneficiaryAccount(), request.amount(),
                PaymentMode.valueOf(request.paymentMode()));

        if (request.ifscCode() != null) payment.setIfscCode(request.ifscCode());

        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<ConnectedPayment> getPayments(String tenantId) {
        return paymentRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public List<ConnectedPayment> getPaymentsByStatus(String tenantId, PaymentStatus status) {
        return paymentRepository.findByTenantIdAndStatus(tenantId, status);
    }

    @Transactional
    public ConnectedPayment completePayment(Long paymentId, String referenceNumber) {
        ConnectedPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setReferenceNumber(referenceNumber);
        payment.setCompletedAt(Instant.now());
        return paymentRepository.save(payment);
    }

    @Transactional
    public ConnectedPayment failPayment(Long paymentId, String reason) {
        ConnectedPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));
        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        return paymentRepository.save(payment);
    }
}
