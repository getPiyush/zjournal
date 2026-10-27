package com.zjournal.auth;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class AdminRoutesTest {

    @ParameterizedTest
    @CsvSource({
            "GET, /", "GET, /health", "GET, /articles", "GET, /articles/42", "GET, /journal",
            "GET, /qna", "GET, /swagger-ui/index.html", "GET, /v3/api-docs",
            "POST, /contacts", "OPTIONS, /journal"})
    void publicRoutes(String method, String path) {
        assertThat(AdminRoutes.requiresAdmin(method, path)).isFalse();
    }

    @ParameterizedTest
    @CsvSource({
            "POST, /articles", "PUT, /articles/42", "DELETE, /articles/42", "PUT, /journal",
            "POST, /qna", "DELETE, /qna/1", "GET, /contacts", "GET, /contacts/1", "DELETE, /contacts/1",
            "GET, /db", "GET, /Contacts", "GET, //contacts"})
    void protectedRoutes(String method, String path) {
        assertThat(AdminRoutes.requiresAdmin(method, path)).isTrue();
    }
}
