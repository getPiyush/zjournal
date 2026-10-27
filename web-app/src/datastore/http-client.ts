import { ApiError } from "./apiError";
import { clearSession, getAuthToken, UNAUTHORIZED_EVENT } from "./authSession";

type RequestOptions = {
  headers?: Record<string, string>;
  method?: string;
  body?: unknown;
};

function toResponse(payload: unknown, init?: ResponseInit) {
  return {
    data: payload,
    status: init?.status ?? 200,
    statusText: init?.statusText ?? "OK",
    headers: init?.headers ?? {},
  };
}

// Attaches the admin's ID token when one is stored. The server ignores it on public routes, so
// it's harmless on the public site's requests too.
function withAuthHeader(headers: Record<string, string> = {}) {
  const token = getAuthToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

async function request(url: string, options: RequestOptions = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: withAuthHeader(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // A rejected token means the admin session is over: drop it, let the admin panel show the
  // sign-in page, and fail the request so the calling action reports an error.
  if (response.status === 401 || response.status === 403) {
    clearSession();
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: { status: response.status } }));
    throw new ApiError(response.status, `Request to ${url} was rejected (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text();

  return toResponse(payload, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers as unknown as HeadersInit,
  });
}

export const httpClient = {
  get: (url: string, options: RequestOptions = {}) => request(url, { ...options, method: "GET" }),
  put: (url: string, body: unknown, options: RequestOptions = {}) => request(url, { ...options, method: "PUT", body }),
  post: (url: string, body: unknown, options: RequestOptions = {}) => request(url, { ...options, method: "POST", body }),
  delete: (url: string, options: RequestOptions = {}) => request(url, { ...options, method: "DELETE" }),
};
