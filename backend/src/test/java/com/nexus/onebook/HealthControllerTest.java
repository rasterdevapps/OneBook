package com.nexus.onebook;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DataSource dataSource;

    @MockitoBean
    private RedisConnectionFactory redisConnectionFactory;

    private Connection dbConnection;
    private Statement dbStatement;
    private RedisConnection redisConnection;

    @BeforeEach
    void setUp() throws Exception {
        dbConnection = mock(Connection.class);
        dbStatement = mock(Statement.class);
        when(dataSource.getConnection()).thenReturn(dbConnection);
        when(dbConnection.createStatement()).thenReturn(dbStatement);
        when(dbStatement.execute("SELECT 1")).thenReturn(true);

        redisConnection = mock(RedisConnection.class);
        when(redisConnectionFactory.getConnection()).thenReturn(redisConnection);
        when(redisConnection.ping()).thenReturn("PONG");
    }

    @Test
    void healthEndpointReturnsUpWhenAllComponentsUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.service").value("OneBook API"))
                .andExpect(jsonPath("$.thread").exists())
                .andExpect(jsonPath("$.components.postgresql").value("UP"))
                .andExpect(jsonPath("$.components.redis").value("UP"));
    }

    @Test
    void healthEndpointReturnsDegradedWhenRedisDown() throws Exception {
        when(redisConnectionFactory.getConnection()).thenThrow(new RuntimeException("Connection refused"));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DEGRADED"))
                .andExpect(jsonPath("$.components.postgresql").value("UP"))
                .andExpect(jsonPath("$.components.redis").value("DOWN"));
    }

    @Test
    void healthEndpointReturnsDegradedWhenPostgresqlDown() throws Exception {
        when(dataSource.getConnection()).thenThrow(new RuntimeException("Connection refused"));

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DEGRADED"))
                .andExpect(jsonPath("$.components.postgresql").value("DOWN"))
                .andExpect(jsonPath("$.components.redis").value("UP"));
    }
}
