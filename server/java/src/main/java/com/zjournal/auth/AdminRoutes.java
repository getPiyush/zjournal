package com.zjournal.auth;

import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Which requests need an admin. Same rules as server/node/auth.js, server/php/auth.php and
 * server/python/app/auth.py, plus this backend's Swagger routes: everything not listed here
 * is protected.
 */
public final class AdminRoutes {

    private static final Set<String> PUBLIC_READS =
            Set.of("", "health", "articles", "journal", "qna", "swagger-ui", "swagger-ui.html", "v3");

    private static final Map<String, Set<String>> PUBLIC_ROUTES = Map.of(
            "GET", PUBLIC_READS,
            "HEAD", PUBLIC_READS,
            // The public "Contact us" form.
            "POST", Set.of("contacts"));

    private AdminRoutes() {
    }

    static String collectionOf(String path) {
        return Arrays.stream(path.toLowerCase(Locale.ROOT).split("/"))
                .filter(part -> !part.isEmpty())
                .findFirst()
                .orElse("");
    }

    public static boolean requiresAdmin(String method, String path) {
        if ("OPTIONS".equals(method)) {
            return false;
        }
        return !PUBLIC_ROUTES.getOrDefault(method, Set.of()).contains(collectionOf(path));
    }
}
