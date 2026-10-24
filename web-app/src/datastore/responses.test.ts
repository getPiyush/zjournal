import { readResponse } from "./responses";
import { ApiError } from "./apiError";
import { encryptOutData } from "./codec";

describe("readResponse", () => {
  test("decrypts a successful response", () => {
    expect(readResponse({ status: 200, data: encryptOutData({ id: "1" }) })).toEqual({ id: "1" });
  });

  test("throws an ApiError with the server's message for a plain error body", () => {
    expect(() =>
      readResponse({ status: 503, data: { error: { code: "AUTH_NOT_CONFIGURED", message: "Not configured" } } })
    ).toThrow(new ApiError(503, "Not configured"));
  });

  test("reads the message out of an encrypted error body", () => {
    const data = encryptOutData({ error: { code: "NOT_FOUND", message: "No item with that id" } });
    expect(() => readResponse({ status: 404, data })).toThrow("No item with that id");
  });

  test("falls back to the status when the body says nothing useful", () => {
    let error: ApiError | undefined;
    try {
      readResponse({ status: 500, data: "Internal Server Error" });
    } catch (err) {
      error = err as ApiError;
    }
    expect(error).toBeInstanceOf(ApiError);
    expect(error?.status).toBe(500);
    expect(error?.message).toBe("HTTP 500");
  });
});
