package com.zjournal.web;

import com.zjournal.auth.PublicView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Pattern;

/**
 * GET /articles/search: the same search, filters and paging as the other three backends.
 * The rules are in server/SEARCH.md and pinned down by server/search_cases.json.
 */
public final class ArticleSearch {

    static final int DEFAULT_LIMIT = 20;
    static final int MAX_LIMIT = 100;
    private static final Set<String> FIELDS = Set.of("all", "title", "author", "content", "id");
    private static final Pattern TAG = Pattern.compile("<[^>]*>");
    private static final Pattern DAY = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}.*", Pattern.DOTALL);
    private static final Pattern INTEGER = Pattern.compile("-?\\d+");

    private ArticleSearch() {
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static String lower(String value) {
        return value.toLowerCase(Locale.ROOT);
    }

    private static String contentText(Map<String, Object> article) {
        List<String> parts = new ArrayList<>();
        if (article.get("content") instanceof List<?> components) {
            for (Object component : components) {
                if (!(component instanceof Map<?, ?> map) || "Image".equals(map.get("componenType"))) {
                    continue;
                }
                Object data = map.get("data");
                parts.add(data instanceof List<?> items
                        ? String.join(" ", items.stream().map(ArticleSearch::text).toList())
                        : text(data));
            }
        }
        return TAG.matcher(String.join(" ", parts)).replaceAll(" ");
    }

    private static String searchable(Map<String, Object> article, String field) {
        return switch (field) {
            case "content" -> contentText(article);
            case "title", "author", "id" -> text(article.get(field));
            default -> String.join(" ", text(article.get("title")), text(article.get("author")),
                    text(article.get("id")), contentText(article));
        };
    }

    private static String dayOf(Map<String, Object> article) {
        String created = text(article.get("createdAt"));
        return DAY.matcher(created).matches() ? created.substring(0, 10) : null;
    }

    private static int intParam(String value, int fallback, int low, int high) {
        int number = fallback;
        if (INTEGER.matcher(value.trim()).matches()) {
            try {
                number = Integer.parseInt(value.trim());
            } catch (NumberFormatException tooBig) {
                number = value.trim().startsWith("-") ? low : high;
            }
        }
        return Math.max(low, Math.min(high, number));
    }

    private static Comparator<Map<String, Object>> comparator(String sort) {
        Comparator<Map<String, Object>> byId = Comparator.comparing(a -> text(a.get("id")));
        Comparator<Map<String, Object>> order;
        if (sort.equals("title-asc") || sort.equals("title-desc")) {
            Comparator<Map<String, Object>> byTitle = Comparator.comparing(a -> lower(text(a.get("title"))));
            order = sort.equals("title-desc") ? byTitle.reversed() : byTitle;
        } else {
            // Undated articles go last in both directions; dated ones sort by their createdAt string.
            Comparator<Map<String, Object>> undatedLast = Comparator.comparing(a -> dayOf(a) == null);
            Comparator<Map<String, Object>> byCreated = Comparator.comparing(a -> text(a.get("createdAt")));
            order = undatedLast.thenComparing(sort.equals("oldest") ? byCreated : byCreated.reversed());
        }
        return order.thenComparing(byId);
    }

    /** @param param a query value by name, "" when absent. */
    public static Map<String, Object> search(List<Map<String, Object>> articles, Function<String, String> param,
                                             boolean isPublic) {
        Function<String, String> get = name -> text(param.apply(name));
        boolean publicOnly = isPublic || get.apply("view").equals("public");
        List<String> words = Arrays.stream(lower(get.apply("q")).split("\\s+")).filter(w -> !w.isEmpty()).toList();
        String field = FIELDS.contains(get.apply("in")) ? get.apply("in") : "all";
        String from = get.apply("from");
        String to = get.apply("to");
        if (!from.isEmpty() && !to.isEmpty() && from.compareTo(to) > 0) {
            String swap = from;
            from = to;
            to = swap;
        }
        String status = get.apply("status").isEmpty() ? "any" : get.apply("status");
        String category = lower(get.apply("categryId"));
        String author = lower(get.apply("author"));
        String start = from;
        String end = to;

        List<Map<String, Object>> found = articles.stream().filter(article -> {
            if (article == null || (publicOnly && !PublicView.isPublicArticle(article))) {
                return false;
            }
            boolean published = PublicView.isTrue(article.get("published"));
            if ((status.equals("published") && !published) || (status.equals("draft") && published)) {
                return false;
            }
            if (!category.isEmpty() && !lower(text(article.get("categryId"))).equals(category)) {
                return false;
            }
            if (!author.isEmpty() && !lower(text(article.get("author"))).equals(author)) {
                return false;
            }
            if (!start.isEmpty() || !end.isEmpty()) {
                String day = dayOf(article);
                if (day == null || (!start.isEmpty() && day.compareTo(start) < 0) || (!end.isEmpty() && day.compareTo(end) > 0)) {
                    return false;
                }
            }
            if (words.isEmpty()) {
                return true;
            }
            String haystack = lower(searchable(article, field));
            return words.stream().allMatch(haystack::contains);
        }).sorted(comparator(get.apply("sort").isEmpty() ? "newest" : get.apply("sort"))).toList();

        int page = intParam(get.apply("page"), 1, 1, 1_000_000);
        int limit = intParam(get.apply("limit"), DEFAULT_LIMIT, 1, MAX_LIMIT);
        int offset = (int) Math.min((long) (page - 1) * limit, found.size());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", found.subList(offset, Math.min(offset + limit, found.size())));
        result.put("total", found.size());
        result.put("page", page);
        result.put("limit", limit);
        return result;
    }
}
