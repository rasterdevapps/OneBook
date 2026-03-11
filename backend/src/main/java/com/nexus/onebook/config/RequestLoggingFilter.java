package com.nexus.onebook.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Structured access logging filter for production observability.
 * Adds trace/span IDs to the MDC for correlation across logs
 * and emits structured request/response log entries.
 */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        String traceId = request.getHeader("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString();
        }
        String spanId = UUID.randomUUID().toString().substring(0, 8);

        MDC.put("traceId", traceId);
        MDC.put("spanId", spanId);

        long startTime = System.currentTimeMillis();

        try {
            response.setHeader("X-Trace-Id", traceId);
            response.setHeader("X-Span-Id", spanId);
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            log.info("method={} path={} status={} duration={}ms traceId={} spanId={}",
                    request.getMethod(), request.getRequestURI(),
                    response.getStatus(), duration, traceId, spanId);
            MDC.clear();
        }
    }
}
