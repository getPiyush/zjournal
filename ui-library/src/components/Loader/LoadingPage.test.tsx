import { render, screen } from "@testing-library/react";

import LoadingPage from "./LoadingPage";

describe("LoadingPage", () => {
  test("renders the loading animation", () => {
    render(<LoadingPage />);
    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
  });
});
