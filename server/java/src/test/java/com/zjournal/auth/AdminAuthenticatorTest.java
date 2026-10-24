package com.zjournal.auth;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AdminAuthenticatorTest {

    private final AdminAuthenticator authenticator = new AdminAuthenticator(token -> switch (token) {
        case "admin-token" -> Map.of("email", "Admin@Example.com", "email_verified", true);
        case "stranger-token" -> Map.of("email", "someone@example.com", "email_verified", true);
        case "unverified-token" -> Map.of("email", "admin@example.com", "email_verified", false);
        default -> throw new IllegalArgumentException("bad token");
    }, List.of("admin@example.com"));

    private void assertRejected(String authorization, int status) {
        assertThatThrownBy(() -> authenticator.authenticate(authorization))
                .isInstanceOfSatisfying(AuthException.class, e -> assertThat(e.getStatus()).isEqualTo(status));
    }

    @Test
    void missingOrNonBearerToken() {
        assertRejected(null, 401);
        assertRejected("Basic abc", 401);
    }

    @Test
    void invalidToken() {
        assertRejected("Bearer garbage", 401);
    }

    @Test
    void nonAdminAndUnverifiedAccounts() {
        assertRejected("Bearer stranger-token", 403);
        assertRejected("Bearer unverified-token", 403);
    }

    @Test
    void adminMatchedCaseInsensitively() throws AuthException {
        assertThat(authenticator.authenticate("Bearer admin-token")).isEqualTo("admin@example.com");
    }
}
