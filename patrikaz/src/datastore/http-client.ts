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

async function request(url: string, options: RequestOptions = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: options.headers ?? {},
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

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
