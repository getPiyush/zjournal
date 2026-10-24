<?php
// Admin gate for the API, equivalent to server/node/auth.js, server/python/app/auth.py and
// AdminAuthInterceptor (Java): verifies the Google ID token the admin panel sends as
// `Authorization: Bearer <token>` and checks its email against ZJOURNAL_ADMIN_EMAILS.
// Plain PHP + the openssl extension, so it works without Composer.

const ZJ_GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v1/certs";
const ZJ_GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];
// Kept next to db.json rather than in the shared temp dir, where another user on the same host
// could plant their own "Google" certificates and forge tokens.
const ZJ_CERTS_CACHE_FILE = __DIR__ . "/.google-certs-cache.json";

// Everything not listed here needs an admin (same rules as the other three backends).
const ZJ_PUBLIC_ROUTES = [
    "GET" => ["", "health", "articles", "journal", "qna"],
    "HEAD" => ["", "health", "articles", "journal", "qna"],
    // The public "Contact us" form.
    "POST" => ["contacts"],
];

// Public reads where an admin sees more. Anonymous callers get only published, non-flagged
// articles, and a journal without the editor's working copy (currentArticle) or the legacy
// adminDetails credential hashes. getters.php applies this when zj_is_public_view() is true.
const ZJ_ADMIN_AWARE_READS = ["articles", "journal"];
const ZJ_JOURNAL_PRIVATE_FIELDS = ["currentArticle", "adminDetails"];

$zj_public_view = false;

function zj_is_public_view(): bool
{
    global $zj_public_view;
    return $zj_public_view;
}

function zj_is_true($value): bool
{
    return $value === true || $value === 1 || $value === "true" || $value === "1";
}

function zj_is_public_article($article): bool
{
    return is_array($article) && zj_is_true($article["published"] ?? null) && !zj_is_true($article["deleteFlag"] ?? null);
}

// $single: the response is one item (GET /articles/<id>) rather than a list.
// Returns [$response, $notFound].
function zj_public_view(string $collection, $response, bool $single): array
{
    if ($collection === "journal" && is_array($response)) {
        foreach (ZJ_JOURNAL_PRIVATE_FIELDS as $field) {
            unset($response[$field]);
        }
        return [$response, false];
    }
    if ($collection === "articles" && is_array($response)) {
        if ($single) {
            return zj_is_public_article($response) ? [$response, false] : [null, true];
        }
        return [array_values(array_filter($response, "zj_is_public_article")), false];
    }
    return [$response, false];
}

class ZjAuthError extends Exception
{
    public int $status;
    public string $errorCode;

    public function __construct(int $status, string $errorCode, string $message)
    {
        parent::__construct($message);
        $this->status = $status;
        $this->errorCode = $errorCode;
    }
}

function zj_collection_of(string $path): string
{
    $parts = array_values(array_filter(explode("/", strtolower($path)), "strlen"));
    return $parts[0] ?? "";
}

function zj_requires_admin(string $method, string $path): bool
{
    if ($method === "OPTIONS") {
        return false;
    }
    return !in_array(zj_collection_of($path), ZJ_PUBLIC_ROUTES[$method] ?? [], true);
}

function zj_base64url_decode(string $input)
{
    return base64_decode(strtr($input, "-_", "+/") . str_repeat("=", (4 - strlen($input) % 4) % 4), true);
}

// Google's signing certificates as {kid: PEM}, cached for as long as Google's Cache-Control says.
function zj_google_certs(bool $forceRefresh = false): array
{
    if (!$forceRefresh && is_readable(ZJ_CERTS_CACHE_FILE)) {
        $cached = json_decode(file_get_contents(ZJ_CERTS_CACHE_FILE), true);
        if (is_array($cached) && ($cached["expiresAt"] ?? 0) > time() && is_array($cached["certs"] ?? null)) {
            return $cached["certs"];
        }
    }

    $body = @file_get_contents(ZJ_GOOGLE_CERTS_URL, false, stream_context_create(["http" => ["timeout" => 5]]));
    $certs = $body === false ? null : json_decode($body, true);
    if (!is_array($certs)) {
        throw new RuntimeException("Couldn't fetch Google's signing certificates");
    }

    $headers = function_exists("http_get_last_response_headers")
        ? (http_get_last_response_headers() ?? [])
        : ($http_response_header ?? []);
    $maxAge = 3600;
    foreach ($headers as $header) {
        if (preg_match('/^cache-control:.*max-age=(\d+)/i', $header, $match)) {
            $maxAge = (int) $match[1];
        }
    }
    @file_put_contents(ZJ_CERTS_CACHE_FILE, json_encode(["expiresAt" => time() + $maxAge, "certs" => $certs]), LOCK_EX);

    return $certs;
}

// Returns the token's payload, or throws if the signature, issuer, audience or expiry is wrong.
function zj_verify_google_id_token(string $jwt, string $clientId, ?callable $certsProvider = null): array
{
    $certsProvider = $certsProvider ?? "zj_google_certs";

    $parts = explode(".", $jwt);
    if (count($parts) !== 3) {
        throw new InvalidArgumentException("Malformed token");
    }
    [$headerB64, $payloadB64, $signatureB64] = $parts;
    $header = json_decode((string) zj_base64url_decode($headerB64), true);
    $payload = json_decode((string) zj_base64url_decode($payloadB64), true);
    $signature = zj_base64url_decode($signatureB64);
    if (!is_array($header) || !is_array($payload) || $signature === false) {
        throw new InvalidArgumentException("Malformed token");
    }
    if (($header["alg"] ?? "") !== "RS256" || !is_string($header["kid"] ?? null)) {
        throw new InvalidArgumentException("Unexpected token algorithm");
    }

    $kid = $header["kid"];
    $certs = $certsProvider(false);
    if (!isset($certs[$kid])) {
        // Google rotates keys; refetch once before giving up on an unknown key id.
        $certs = $certsProvider(true);
    }
    if (!isset($certs[$kid])) {
        throw new InvalidArgumentException("Unknown signing key");
    }
    if (openssl_verify("$headerB64.$payloadB64", $signature, $certs[$kid], OPENSSL_ALGO_SHA256) !== 1) {
        throw new InvalidArgumentException("Bad signature");
    }

    if (!in_array($payload["iss"] ?? "", ZJ_GOOGLE_ISSUERS, true)) {
        throw new InvalidArgumentException("Wrong issuer");
    }
    if (($payload["aud"] ?? "") !== $clientId) {
        throw new InvalidArgumentException("Wrong audience");
    }
    if (!is_numeric($payload["exp"] ?? null) || $payload["exp"] < time()) {
        throw new InvalidArgumentException("Token expired");
    }

    return $payload;
}

// Returns the admin's email, or throws ZjAuthError.
function zj_authenticate(string $authorization, callable $verifyToken, array $adminEmails): string
{
    if (!preg_match('/^Bearer\s+(\S+)$/i', $authorization, $match)) {
        throw new ZjAuthError(401, "UNAUTHORIZED", "Admin sign-in required");
    }

    try {
        $payload = $verifyToken($match[1]);
    } catch (Throwable $err) {
        error_log("zjournal admin auth: token rejected: " . $err->getMessage());
        throw new ZjAuthError(401, "UNAUTHORIZED", "Invalid or expired sign-in token");
    }

    $email = strtolower((string) ($payload["email"] ?? ""));
    $allowed = array_map("strtolower", $adminEmails);
    if (($payload["email_verified"] ?? false) !== true || !in_array($email, $allowed, true)) {
        throw new ZjAuthError(403, "FORBIDDEN", "This account is not an admin");
    }
    return $email;
}

function zj_env(string $name): string
{
    $value = $_SERVER[$name] ?? getenv($name);
    return is_string($value) ? $value : "";
}

function zj_authorization_header(): string
{
    // Apache under CGI/FPM drops Authorization unless .htaccess copies it into the environment
    // (it then arrives as REDIRECT_HTTP_AUTHORIZATION).
    foreach (["HTTP_AUTHORIZATION", "REDIRECT_HTTP_AUTHORIZATION"] as $key) {
        if (!empty($_SERVER[$key])) {
            return $_SERVER[$key];
        }
    }
    if (function_exists("getallheaders")) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, "Authorization") === 0) {
                return $value;
            }
        }
    }
    return "";
}

function zj_reject(int $status, string $code, string $message)
{
    http_response_code($status);
    echo json_encode(["error" => ["code" => $code, "message" => $message]]);
    exit;
}

// Called from index.php before dispatching. Ends the request if it needs an admin and the caller
// isn't one. Auth may only be left unconfigured with ZJOURNAL_ENV=development (set by
// `npm run server`); anywhere else protected routes answer 503 until it's configured.
function zj_enforce_admin_auth()
{
    global $zj_public_view;

    $method = $_SERVER["REQUEST_METHOD"];
    $path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?: "/";
    $needsAdmin = zj_requires_admin($method, $path);
    $adminAwareRead = in_array($method, ["GET", "HEAD"], true)
        && in_array(zj_collection_of($path), ZJ_ADMIN_AWARE_READS, true);
    if (!$needsAdmin && !$adminAwareRead) {
        return;
    }

    $clientId = zj_env("ZJOURNAL_GOOGLE_CLIENT_ID");
    $adminEmails = array_values(array_filter(array_map("trim", explode(",", zj_env("ZJOURNAL_ADMIN_EMAILS"))), "strlen"));
    $authorization = zj_authorization_header();

    if ($clientId === "" || count($adminEmails) === 0) {
        if (zj_env("ZJOURNAL_ENV") === "development") {
            if ($needsAdmin) {
                error_log("zjournal: admin auth is DISABLED (development, ZJOURNAL_GOOGLE_CLIENT_ID / ZJOURNAL_ADMIN_EMAILS not set)");
            }
            return;
        }
        if (!$needsAdmin) {
            // Nobody can sign in, so everyone gets the public view.
            $zj_public_view = true;
            return;
        }
        error_log("zjournal: refusing protected request, admin auth is not configured");
        zj_reject(503, "AUTH_NOT_CONFIGURED", "Admin auth is not configured on this server");
    }

    // Anonymous public read: the public view. Presenting credentials means they must be valid,
    // though, rather than silently falling back to the public view.
    if (!$needsAdmin && $authorization === "") {
        $zj_public_view = true;
        return;
    }

    try {
        zj_authenticate(
            $authorization,
            fn($token) => zj_verify_google_id_token($token, $clientId),
            $adminEmails
        );
    } catch (ZjAuthError $err) {
        zj_reject($err->status, $err->errorCode, $err->getMessage());
    }
}
