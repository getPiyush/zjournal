package com.zjournal.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Runs against its own temporary db.json holding one public article, one draft and one flagged. */
@SpringBootTest(properties = {
        "zjournal.env=production",
        "zjournal.encryption-enabled=false",
        "zjournal.auth.google-client-id=client-id.apps.googleusercontent.com",
        "zjournal.auth.admin-emails=admin@example.com"})
@AutoConfigureMockMvc
class PublicViewIntegrationTest {

    @DynamicPropertySource
    static void dbFile(DynamicPropertyRegistry registry) throws IOException {
        Path db = Files.createTempFile("zjournal-public-view", ".json");
        db.toFile().deleteOnExit();
        Map<String, Object> data = Map.of(
                "articles", List.of(
                        Map.of("id", "public", "title", "Public", "published", true, "deleteFlag", false),
                        Map.of("id", "draft", "title", "Draft", "published", false, "deleteFlag", false),
                        Map.of("id", "flagged", "title", "Flagged", "published", true, "deleteFlag", true)),
                "journal", Map.of(
                        "title", "J",
                        "currentArticle", Map.of("id", "draft"),
                        "adminDetails", Map.of("id", "hash", "passPhase", "hash")),
                "contacts", List.of(),
                "qna", List.of());
        new ObjectMapper().writeValue(db.toFile(), data);
        registry.add("zjournal.db-file", db::toString);
    }

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TokenVerifier tokenVerifier;

    @BeforeEach
    void setUp() throws Exception {
        when(tokenVerifier.verify(anyString())).thenAnswer(call -> switch (call.<String>getArgument(0)) {
            case "admin-token" -> Map.of("email", "admin@example.com", "email_verified", true);
            default -> throw new IllegalArgumentException("bad token");
        });
    }

    @Test
    void anonymousListsOnlyShowPublicArticles() throws Exception {
        mockMvc.perform(get("/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", containsInAnyOrder("public")));
    }

    @Test
    void anonymousCantOpenADraftOrFlaggedArticleById() throws Exception {
        mockMvc.perform(get("/articles/public")).andExpect(status().isOk());
        mockMvc.perform(get("/articles/draft")).andExpect(status().isNotFound());
        mockMvc.perform(get("/articles/flagged")).andExpect(status().isNotFound());
    }

    @Test
    void adminSeesEverything() throws Exception {
        mockMvc.perform(get("/articles").header("Authorization", "Bearer admin-token"))
                .andExpect(jsonPath("$[*].id", containsInAnyOrder("public", "draft", "flagged")));
        mockMvc.perform(get("/articles/draft").header("Authorization", "Bearer admin-token"))
                .andExpect(status().isOk());
    }

    @Test
    void anonymousJournalHasNoPrivateFields() throws Exception {
        mockMvc.perform(get("/journal"))
                .andExpect(jsonPath("$.title").value("J"))
                .andExpect(jsonPath("$.currentArticle").doesNotExist())
                .andExpect(jsonPath("$.adminDetails").doesNotExist());
        mockMvc.perform(get("/journal").header("Authorization", "Bearer admin-token"))
                .andExpect(jsonPath("$.adminDetails.id").value("hash"));
    }

    @Test
    void aBadTokenOnAPublicReadIsRejectedNotDowngraded() throws Exception {
        mockMvc.perform(get("/articles").header("Authorization", "Bearer forged"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousSearchOnlyFindsPublicArticles() throws Exception {
        mockMvc.perform(get("/articles/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[*].id", containsInAnyOrder("public")))
                .andExpect(jsonPath("$.total").value(1));
        mockMvc.perform(get("/articles/search").param("status", "draft"))
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void adminSearchFindsEverything() throws Exception {
        mockMvc.perform(get("/articles/search").header("Authorization", "Bearer admin-token"))
                .andExpect(jsonPath("$.items[*].id", containsInAnyOrder("public", "draft", "flagged")));
        mockMvc.perform(get("/articles/search").param("q", "draft").header("Authorization", "Bearer admin-token"))
                .andExpect(jsonPath("$.items[*].id", containsInAnyOrder("draft")));
    }
}
