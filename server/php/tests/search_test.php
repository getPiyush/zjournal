<?php
// Run with: npm run test:server:php (from the repo root), or `php tests/search_test.php`.
// Runs the shared cases in server/search_cases.json, which every backend's tests run too.

require __DIR__ . "/../auth.php";
require __DIR__ . "/../search.php";

$shared = json_decode(file_get_contents(__DIR__ . "/../../search_cases.json"), true);
$failures = 0;

foreach ($shared["cases"] as $case) {
    $result = zj_search_articles($shared["articles"], $case["params"], $case["public"]);
    $ids = array_map(fn($a) => $a["id"], $result["items"]);
    $ok = $ids === $case["ids"]
        && $result["total"] === $case["total"]
        && (!isset($case["page"]) || $result["page"] === $case["page"])
        && (!isset($case["limit"]) || $result["limit"] === $case["limit"]);
    if ($ok) {
        echo "✔ {$case["name"]}\n";
    } else {
        $failures++;
        echo "✖ {$case["name"]}: got [" . implode(",", $ids) . "] total {$result["total"]}\n";
    }
}

echo "\n" . (count($shared["cases"]) - $failures) . " passed, $failures failed\n";
exit($failures > 0 ? 1 : 0);
