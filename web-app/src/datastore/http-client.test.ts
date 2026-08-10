import { httpClient } from "./http-client";

function mockFetchResponse({
  contentType = "application/json",
  json = {},
  text = "",
  status = 200,
  statusText = "OK",
  jsonError,
}: {
  contentType?: string;
  json?: unknown;
  text?: string;
  status?: number;
  statusText?: string;
  jsonError?: Error;
} = {}) {
  return {
    status,
    statusText,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-type" ? contentType : null,
    },
    json: jsonError
      ? jest.fn().mockRejectedValue(jsonError)
      : jest.fn().mockResolvedValue(json),
    text: jest.fn().mockResolvedValue(text),
  };
}

describe("httpClient", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test("get() issues a GET request with no body", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(mockFetchResponse({ json: { id: "1" } }));
    global.fetch = fetchMock as any;

    const response = await httpClient.get("http://api.test/articles");

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/articles", {
      method: "GET",
      headers: {},
      body: undefined,
    });
    expect(response).toEqual({
      data: { id: "1" },
      status: 200,
      statusText: "OK",
      headers: expect.any(Object),
    });
  });

  test("post() sends a JSON-stringified body and merges custom headers", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(mockFetchResponse({ json: { id: "2" } }));
    global.fetch = fetchMock as any;

    const body = { title: "New Article" };
    await httpClient.post("http://api.test/articles", body, {
      headers: { "X-Custom": "value" },
    });

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/articles", {
      method: "POST",
      headers: { "X-Custom": "value" },
      body: JSON.stringify(body),
    });
  });

  test("put() sends a PUT request with a JSON-stringified body", async () => {
    const fetchMock = jest.fn().mockResolvedValue(mockFetchResponse());
    global.fetch = fetchMock as any;

    const body = { id: "1", title: "Updated" };
    await httpClient.put("http://api.test/articles/1", body);

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/articles/1", {
      method: "PUT",
      headers: {},
      body: JSON.stringify(body),
    });
  });

  test("delete() issues a DELETE request with no body", async () => {
    const fetchMock = jest.fn().mockResolvedValue(mockFetchResponse());
    global.fetch = fetchMock as any;

    await httpClient.delete("http://api.test/articles/1");

    expect(fetchMock).toHaveBeenCalledWith("http://api.test/articles/1", {
      method: "DELETE",
      headers: {},
      body: undefined,
    });
  });

  test("parses a text body when the response is not JSON", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse({ contentType: "text/plain", text: "plain body" })
      );
    global.fetch = fetchMock as any;

    const response = await httpClient.get("http://api.test/raw");

    expect(response.data).toBe("plain body");
  });

  test("resolves to a null payload when the JSON body fails to parse", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(
        mockFetchResponse({ jsonError: new Error("invalid json") })
      );
    global.fetch = fetchMock as any;

    const response = await httpClient.get("http://api.test/broken");

    expect(response.data).toBeNull();
  });

  test("passes through the response status, statusText and headers", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      mockFetchResponse({ status: 404, statusText: "Not Found" })
    );
    global.fetch = fetchMock as any;

    const response = await httpClient.get("http://api.test/missing");

    expect(response.status).toBe(404);
    expect(response.statusText).toBe("Not Found");
  });
});
