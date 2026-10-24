package com.zjournal.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/** Checks a request's bearer token belongs to an allowlisted admin. */
public class AdminAuthenticator {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthenticator.class);
    private static final Pattern BEARER = Pattern.compile("^Bearer\\s+(\\S+)$", Pattern.CASE_INSENSITIVE);

    private final TokenVerifier verifier;
    private final Set<String> adminEmails;

    public AdminAuthenticator(TokenVerifier verifier, List<String> adminEmails) {
        this.verifier = verifier;
        this.adminEmails = adminEmails.stream()
                .map(email -> email.toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
    }

    /** Returns the admin's email, or throws AuthException (401 or 403). */
    public String authenticate(String authorization) throws AuthException {
        Matcher match = BEARER.matcher(authorization == null ? "" : authorization);
        if (!match.matches()) {
            throw new AuthException(401, "UNAUTHORIZED", "Admin sign-in required");
        }

        Map<String, Object> claims;
        try {
            claims = verifier.verify(match.group(1));
        } catch (Exception e) {
            log.debug("Rejected admin token: {}", e.getMessage());
            throw new AuthException(401, "UNAUTHORIZED", "Invalid or expired sign-in token");
        }

        String email = String.valueOf(claims.getOrDefault("email", "")).toLowerCase(Locale.ROOT);
        if (!Boolean.TRUE.equals(claims.get("email_verified")) || !adminEmails.contains(email)) {
            throw new AuthException(403, "FORBIDDEN", "This account is not an admin");
        }
        return email;
    }
}
