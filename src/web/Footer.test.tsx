import { render, screen } from "@testing-library/react";

import Footer from "./Footer";

describe("Footer", () => {
  test("renders the copyright notice", () => {
    render(<Footer />);
    expect(screen.getByText(/Copyright 2022/)).toBeInTheDocument();
  });

  test("shows the development badge outside of production", () => {
    render(<Footer />);
    // NODE_ENV is "test" while running Jest, so the dev badge should render.
    expect(screen.getByTitle(/development version/)).toBeInTheDocument();
  });
});
