import { render, screen } from "@testing-library/react";

import { Logo } from "./Logo";

describe("Logo", () => {
  test("renders the site title and byline", () => {
    render(<Logo />);
    expect(screen.getByText("Article Collections")).toBeInTheDocument();
    expect(screen.getByText("by Piyush Praharaj")).toBeInTheDocument();
  });
});
