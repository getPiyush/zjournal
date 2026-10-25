package com.zjournal.auth;

import jakarta.servlet.http.HttpServletRequest;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Public reads where an admin sees more. Anonymous callers get only published, non-flagged
 * articles, and a journal without the editor's working copy (currentArticle) or the legacy
 * adminDetails credential hashes. AdminAuthInterceptor marks anonymous reads; the article and
 * journal controllers apply the view.
 */
public final class PublicView {

    static final String ATTRIBUTE = "zjournal.publicView";
    static final Set<String> ADMIN_AWARE_READS = Set.of("articles", "journal");
    private static final List<String> JOURNAL_PRIVATE_FIELDS = List.of("currentArticle", "adminDetails");

    private PublicView() {
    }

    public static boolean applies(HttpServletRequest request) {
        return Boolean.TRUE.equals(request.getAttribute(ATTRIBUTE));
    }

    /** How the stored data spells true: {@code true}, {@code 1}, {@code "true"} or {@code "1"}. */
    public static boolean isTrue(Object value) {
        return Boolean.TRUE.equals(value) || Integer.valueOf(1).equals(value) || "true".equals(value) || "1".equals(value);
    }

    public static boolean isPublicArticle(Map<String, Object> article) {
        return article != null && isTrue(article.get("published")) && !isTrue(article.get("deleteFlag"));
    }

    public static Map<String, Object> publicJournal(Map<String, Object> journal) {
        Map<String, Object> copy = new LinkedHashMap<>(journal);
        JOURNAL_PRIVATE_FIELDS.forEach(copy::remove);
        return copy;
    }
}
