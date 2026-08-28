import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteErrorBoundary() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? (error.data as string) || error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <div className="container" role="alert">
      <div className="row">
        <div className="col">
          <h2>Something went wrong</h2>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}
