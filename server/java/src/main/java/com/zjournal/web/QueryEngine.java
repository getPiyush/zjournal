package com.zjournal.web;

import org.springframework.util.MultiValueMap;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Reimplements the ad-hoc query engine from server/php/getters.php: repeated query keys
 * (e.g. ?id=a&id=b) OR their matches together, distinct keys AND across each other,
 * "field_like=value" does a substring match, and "_sort"/"_order" sort the final result.
 */
public final class QueryEngine {

    private static final String LIKE_SUFFIX = "_like";

    private QueryEngine() {
    }

    public static List<Map<String, Object>> apply(List<Map<String, Object>> items, MultiValueMap<String, String> params) {
        List<Map<String, Object>> result = items;
        String sortField = null;
        boolean descending = false;

        for (Map.Entry<String, List<String>> entry : params.entrySet()) {
            String key = entry.getKey();
            List<String> values = entry.getValue();
            if (values == null || values.isEmpty()) {
                continue;
            }

            if ("_sort".equals(key)) {
                sortField = values.get(0);
                continue;
            }
            if ("_order".equals(key)) {
                descending = values.get(0) != null && values.get(0).toLowerCase().contains("desc");
                continue;
            }

            boolean like = key.endsWith(LIKE_SUFFIX);
            String field = like ? key.substring(0, key.length() - LIKE_SUFFIX.length()) : key;

            Set<Map<String, Object>> seen = Collections.newSetFromMap(new IdentityHashMap<>());
            List<Map<String, Object>> matches = new ArrayList<>();
            for (String value : values) {
                for (Map<String, Object> item : result) {
                    if (matches(item, field, value, like) && seen.add(item)) {
                        matches.add(item);
                    }
                }
            }
            result = matches;
        }

        if (sortField != null) {
            String field = sortField;
            Comparator<Map<String, Object>> comparator = Comparator.comparing(item -> String.valueOf(item.get(field)));
            if (descending) {
                comparator = comparator.reversed();
            }
            result = result.stream().sorted(comparator).collect(Collectors.toList());
        }

        return result;
    }

    private static boolean matches(Map<String, Object> item, String field, String value, boolean like) {
        Object fieldValue = item.get(field);
        if (fieldValue == null) {
            return false;
        }
        String stringValue = String.valueOf(fieldValue);
        return like ? stringValue.contains(value) : stringValue.equalsIgnoreCase(value);
    }
}
