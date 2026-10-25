<?php
// GET /articles/search: the same search, filters and paging as the other three backends.
// The rules are in server/SEARCH.md and pinned down by server/search_cases.json.
// Needs auth.php (zj_is_true, zj_is_public_article).

const ZJ_SEARCH_DEFAULT_LIMIT = 20;
const ZJ_SEARCH_MAX_LIMIT = 100;
const ZJ_SEARCH_FIELDS = ["all", "title", "author", "content", "id"];

function zj_text($value): string
{
    if ($value === null) {
        return "";
    }
    if (is_bool($value)) {
        return $value ? "true" : "false";
    }
    return is_scalar($value) ? (string) $value : "";
}

function zj_content_text(array $article): string
{
    $parts = [];
    foreach (is_array($article["content"] ?? null) ? $article["content"] : [] as $component) {
        if (!is_array($component) || ($component["componenType"] ?? null) === "Image") {
            continue;
        }
        $data = $component["data"] ?? null;
        $parts[] = is_array($data) ? implode(" ", array_map("zj_text", $data)) : zj_text($data);
    }
    return preg_replace("/<[^>]*>/", " ", implode(" ", $parts));
}

function zj_searchable(array $article, string $field): string
{
    if ($field === "content") {
        return zj_content_text($article);
    }
    if (in_array($field, ["title", "author", "id"], true)) {
        return zj_text($article[$field] ?? null);
    }
    return implode(" ", [
        zj_text($article["title"] ?? null),
        zj_text($article["author"] ?? null),
        zj_text($article["id"] ?? null),
        zj_content_text($article),
    ]);
}

function zj_day_of(array $article): ?string
{
    $created = zj_text($article["createdAt"] ?? null);
    return preg_match('/^\d{4}-\d{2}-\d{2}/', $created) ? substr($created, 0, 10) : null;
}

function zj_int_param(string $value, int $default, int $low, int $high): int
{
    $number = preg_match('/^-?\d+$/', trim($value)) ? (int) $value : $default;
    return max($low, min($high, $number));
}

// Unicode-aware, like the other backends' lowercasing (strtolower only handles ASCII).
function zj_lower(string $value): string
{
    return mb_strtolower($value, "UTF-8");
}

// Plain byte-wise comparison: PHP's < and > would compare numeric-looking strings as numbers.
function zj_cmp(string $a, string $b): int
{
    return strcmp($a, $b) <=> 0;
}

function zj_search_articles(array $articles, array $params, bool $public): array
{
    $param = function (string $name) use ($params): string {
        $value = $params[$name] ?? "";
        return zj_text(is_array($value) ? ($value[0] ?? "") : $value);
    };

    $public = $public || $param("view") === "public";
    $words = preg_split('/\s+/u', zj_lower($param("q")), -1, PREG_SPLIT_NO_EMPTY);
    $field = in_array($param("in"), ZJ_SEARCH_FIELDS, true) ? $param("in") : "all";
    $from = $param("from");
    $to = $param("to");
    if ($from !== "" && $to !== "" && strcmp($from, $to) > 0) {
        [$from, $to] = [$to, $from];
    }
    $status = $param("status") ?: "any";
    $category = zj_lower($param("categryId"));
    $author = zj_lower($param("author"));

    $found = array_values(array_filter($articles, function ($article) use (
        $public, $status, $category, $author, $from, $to, $words, $field
    ) {
        if (!is_array($article)) {
            return false;
        }
        if ($public && !zj_is_public_article($article)) {
            return false;
        }
        $published = zj_is_true($article["published"] ?? null);
        if (($status === "published" && !$published) || ($status === "draft" && $published)) {
            return false;
        }
        if ($category !== "" && zj_lower(zj_text($article["categryId"] ?? null)) !== $category) {
            return false;
        }
        if ($author !== "" && zj_lower(zj_text($article["author"] ?? null)) !== $author) {
            return false;
        }
        if ($from !== "" || $to !== "") {
            $day = zj_day_of($article);
            if ($day === null || ($from !== "" && strcmp($day, $from) < 0) || ($to !== "" && strcmp($day, $to) > 0)) {
                return false;
            }
        }
        if (count($words) === 0) {
            return true;
        }
        $haystack = zj_lower(zj_searchable($article, $field));
        foreach ($words as $word) {
            if (!str_contains($haystack, $word)) {
                return false;
            }
        }
        return true;
    }));

    $sort = $param("sort") ?: "newest";
    usort($found, function (array $a, array $b) use ($sort): int {
        if ($sort === "title-asc" || $sort === "title-desc") {
            $order = zj_cmp(zj_lower(zj_text($a["title"] ?? null)), zj_lower(zj_text($b["title"] ?? null)));
            if ($sort === "title-desc") {
                $order = -$order;
            }
        } else {
            // Undated articles go last in both directions; dated ones sort by their createdAt string.
            $aDated = zj_day_of($a) !== null;
            $bDated = zj_day_of($b) !== null;
            if ($aDated !== $bDated) {
                return $aDated ? -1 : 1;
            }
            $order = zj_cmp(zj_text($a["createdAt"] ?? null), zj_text($b["createdAt"] ?? null));
            if ($sort !== "oldest") {
                $order = -$order;
            }
        }
        return $order ?: zj_cmp(zj_text($a["id"] ?? null), zj_text($b["id"] ?? null));
    });

    $page = zj_int_param($param("page"), 1, 1, 1000000);
    $limit = zj_int_param($param("limit"), ZJ_SEARCH_DEFAULT_LIMIT, 1, ZJ_SEARCH_MAX_LIMIT);
    return [
        "items" => array_slice($found, ($page - 1) * $limit, $limit),
        "total" => count($found),
        "page" => $page,
        "limit" => $limit,
    ];
}
