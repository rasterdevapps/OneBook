package com.nexus.onebook;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;

    public HealthController(DataSource dataSource,
                            @Autowired(required = false) RedisConnectionFactory redisConnectionFactory) {
        this.dataSource = dataSource;
        this.redisConnectionFactory = redisConnectionFactory;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "OneBook API");
        response.put("thread", Thread.currentThread().toString());

        Map<String, String> components = new LinkedHashMap<>();
        components.put("postgresql", checkPostgresql());
        components.put("redis", checkRedis());
        response.put("components", components);

        boolean allUp = components.values().stream().allMatch("UP"::equals);
        response.put("status", allUp ? "UP" : "DEGRADED");

        return ResponseEntity.ok(response);
    }

    private String checkPostgresql() {
        try (var conn = dataSource.getConnection();
             var stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            return "UP";
        } catch (Exception e) {
            return "DOWN";
        }
    }

    private String checkRedis() {
        if (redisConnectionFactory == null) {
            return "DOWN";
        }
        try (var conn = redisConnectionFactory.getConnection()) {
            String pong = conn.ping();
            return "PONG".equals(pong) ? "UP" : "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }
}
