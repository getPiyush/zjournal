import { ApiError } from "./apiError";
import { decryptData } from "./codec";

// Error bodies are `{"error": {"message": ...}}`, sent plain or inside the ezjData envelope
// depending on the backend and the error.
const serverMessage = (data: any): string | undefined => {
  if (typeof data?.error?.message === "string") return data.error.message;
  try {
    const message = decryptData(data)?.error?.message;
    return typeof message === "string" ? message : undefined;
  } catch {
    return undefined;
  }
};

// The http client only throws on 401/403. Treat every other error status as a failure too,
// instead of decrypting an error envelope as if it were the requested data.
export const readResponse = (response: { status?: number; data: any }) => {
  if (response.status !== undefined && response.status >= 400) {
    throw new ApiError(response.status, serverMessage(response.data) ?? `HTTP ${response.status}`);
  }
  return decryptData(response.data);
};
