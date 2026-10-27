package com.zjournal.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Only reads and rejected writes, so the shared db.json is never modified (DataStore flushes
 * dirty state on shutdown).
 */
@SpringBootTest(properties = {
        "zjournal.env=production",
        "zjournal.encryption-enabled=false",
        "zjournal.auth.google-client-id=client-id.apps.googleusercontent.com",
        "zjournal.auth.admin-emails=admin@example.com"})
@AutoConfigureMockMvc
class AdminAuthIntegrationTest {

    private static final String ORIGIN = "http://localhost:3000";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TokenVerifier tokenVerifier;

    @BeforeEach
    void setUp() throws Exception {
        when(tokenVerifier.verify(anyString())).thenAnswer(call -> switch (call.<String>getArgument(0)) {
            case "admin-token" -> Map.of("email", "admin@example.com", "email_verified", true);
            case "stranger-token" -> Map.of("email", "x@example.com", "email_verified", true);
            default -> throw new IllegalArgumentException("bad token");
        });
    }

    @Test
    void publicReadsNeedNoToken() throws Exception {
        mockMvc.perform(get("/journal")).andExpect(status().isOk());
    }

    @Test
    void rejectsAnonymousContactReadsWithCorsHeaders() throws Exception {
        mockMvc.perform(get("/contacts").header("Origin", ORIGIN))
                .andExpect(status().isUnauthorized())
                .andExpect(header().exists("Access-Control-Allow-Origin"))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void preflightPassesWithoutAToken() throws Exception {
        mockMvc.perform(options("/journal")
                        .header("Origin", ORIGIN)
                        .header("Access-Control-Request-Method", "PUT")
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"));
    }

    @Test
    void rejectsANonAdminWrite() throws Exception {
        mockMvc.perform(put("/journal").header("Authorization", "Bearer stranger-token")
                        .contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void rejectsAnInvalidToken() throws Exception {
        mockMvc.perform(put("/journal").header("Authorization", "Bearer forged")
                        .contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void letsAnAdminReadContacts() throws Exception {
        mockMvc.perform(get("/contacts").header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk());
    }
}
