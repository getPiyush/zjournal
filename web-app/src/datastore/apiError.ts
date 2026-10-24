// An HTTP error from the API, carrying the status so callers can tell "sign in again" (401/403,
// handled by the admin panel's sign-in screen) apart from failures worth reporting.
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isAuthRejection = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);
