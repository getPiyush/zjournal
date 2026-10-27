<?php
// Run with: npm run test:server:php (from the repo root), or `php tests/auth_test.php`.
// Signs tokens with a throwaway RSA key + self-signed certificate, so signature checking is real.

require __DIR__ . "/../auth.php";

$failures = 0;
$passes = 0;

function check(string $name, bool $ok)
{
    global $failures, $passes;
    if ($ok) {
        $passes++;
        echo "✔ $name\n";
    } else {
        $failures++;
        echo "✖ $name\n";
    }
}

function throws(callable $fn, string $class = Throwable::class, ?int $status = null): bool
{
    try {
        $fn();
    } catch (Throwable $err) {
        return $err instanceof $class && ($status === null || $err->status === $status);
    }
    return false;
}

function b64url(string $data): string
{
    return rtrim(strtr(base64_encode($data), "+/", "-_"), "=");
}

const CLIENT_ID = "client-id.apps.googleusercontent.com";

$key = openssl_pkey_new(["private_key_bits" => 2048, "private_key_type" => OPENSSL_KEYTYPE_RSA]);
$cert = openssl_csr_sign(openssl_csr_new(["commonName" => "test"], $key), null, $key, 1);
openssl_x509_export($cert, $certPem);
$otherKey = openssl_pkey_new(["private_key_bits" => 2048, "private_key_type" => OPENSSL_KEYTYPE_RSA]);

function sign_token(array $payload, $key, array $header = []): string
{
    $header = array_merge(["alg" => "RS256", "kid" => "key-1", "typ" => "JWT"], $header);
    $payload = array_merge([
        "iss" => "https://accounts.google.com",
        "aud" => CLIENT_ID,
        "exp" => time() + 3600,
        "email" => "admin@example.com",
        "email_verified" => true,
    ], $payload);
    $input = b64url(json_encode($header)) . "." . b64url(json_encode($payload));
    openssl_sign($input, $signature, $key, OPENSSL_ALGO_SHA256);
    return $input . "." . b64url($signature);
}

$refreshes = 0;
$certs = function (bool $force) use ($certPem, &$refreshes) {
    if ($force) {
        $refreshes++;
    }
    return ["key-1" => $certPem];
};
$verify = fn($token) => zj_verify_google_id_token($token, CLIENT_ID, $certs);

// --- route rules
check("public reads and the contact form need no sign-in",
    !zj_requires_admin("GET", "/") && !zj_requires_admin("GET", "/health")
    && !zj_requires_admin("GET", "/articles") && !zj_requires_admin("GET", "/articles/42")
    && !zj_requires_admin("GET", "/journal") && !zj_requires_admin("GET", "/qna")
    && !zj_requires_admin("POST", "/contacts") && !zj_requires_admin("OPTIONS", "/journal"));
check("writes, contact reads and other files need an admin",
    zj_requires_admin("POST", "/articles") && zj_requires_admin("PUT", "/articles/42")
    && zj_requires_admin("DELETE", "/articles/42") && zj_requires_admin("PUT", "/journal")
    && zj_requires_admin("POST", "/qna") && zj_requires_admin("DELETE", "/qna/1")
    && zj_requires_admin("GET", "/contacts") && zj_requires_admin("GET", "/db.json")
    && zj_requires_admin("GET", "/error_log") && zj_requires_admin("GET", "/backupdata.php"));
check("route matching ignores case and repeated slashes",
    zj_requires_admin("GET", "/Contacts") && zj_requires_admin("GET", "//contacts"));

// --- token verification
check("accepts a correctly signed token", $verify(sign_token([], $key))["email"] === "admin@example.com");
check("rejects a token signed by another key", throws(fn() => $verify(sign_token([], $otherKey))));
check("rejects a tampered payload", throws(function () use ($verify, $key) {
    [$h, , $s] = explode(".", sign_token([], $key));
    $verify("$h." . b64url(json_encode(["email" => "admin@example.com", "aud" => CLIENT_ID])) . ".$s");
}));
check("rejects the wrong audience", throws(fn() => $verify(sign_token(["aud" => "other-client"], $key))));
check("rejects the wrong issuer", throws(fn() => $verify(sign_token(["iss" => "https://evil.example"], $key))));
check("rejects an expired token", throws(fn() => $verify(sign_token(["exp" => time() - 10], $key))));
check("rejects a non-RS256 token", throws(fn() => $verify(sign_token([], $key, ["alg" => "HS256"]))));
check("rejects garbage", throws(fn() => $verify("not.a.jwt")) && throws(fn() => $verify("nope")));
$refreshes = 0;
check("refetches certificates once for an unknown key id",
    throws(fn() => $verify(sign_token([], $key, ["kid" => "rotated"]))) && $refreshes === 1);

// --- authenticate
$admins = ["admin@example.com"];
check("401 without a bearer token", throws(fn() => zj_authenticate("", $verify, $admins), ZjAuthError::class, 401));
check("401 for an invalid token", throws(fn() => zj_authenticate("Bearer junk", $verify, $admins), ZjAuthError::class, 401));
check("403 for a non-admin account", throws(
    fn() => zj_authenticate("Bearer " . sign_token(["email" => "someone@example.com"], $key), $verify, $admins),
    ZjAuthError::class, 403));
check("403 for an unverified email", throws(
    fn() => zj_authenticate("Bearer " . sign_token(["email_verified" => false], $key), $verify, $admins),
    ZjAuthError::class, 403));
check("admin email matched case-insensitively",
    zj_authenticate("Bearer " . sign_token(["email" => "Admin@Example.com"], $key), $verify, $admins) === "admin@example.com");

// --- public view
check("only published, non-flagged articles are public",
    zj_is_public_article(["published" => true, "deleteFlag" => false])
    && zj_is_public_article(["published" => true])
    && !zj_is_public_article(["published" => false])
    && !zj_is_public_article(["deleteFlag" => false])
    && !zj_is_public_article(["published" => true, "deleteFlag" => true]));
$list = [
    ["id" => "a", "published" => true, "deleteFlag" => false],
    ["id" => "draft", "published" => false, "deleteFlag" => false],
    ["id" => "flagged", "published" => true, "deleteFlag" => true],
];
check("lists keep only public articles", array_column(zj_public_view("articles", $list, false)[0], "id") === ["a"]);
check("a single hidden article is not found", zj_public_view("articles", $list[1], true) === [null, true]);
check("a single public article is returned", zj_public_view("articles", $list[0], true) === [$list[0], false]);
check("the journal loses its private fields",
    zj_public_view("journal", ["title" => "J", "currentArticle" => [], "adminDetails" => []], false)[0] === ["title" => "J"]);

echo "\n$passes passed, $failures failed\n";
exit($failures > 0 ? 1 : 0);
