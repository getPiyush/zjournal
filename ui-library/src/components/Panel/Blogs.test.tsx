import { render, screen } from "@testing-library/react";

import Blogs from "./Blogs";

describe("Blogs", () => {
  test("renders an archive link for each month since the start date", () => {
    render(<Blogs startDate="2024-01-01T00:00:00" />);
    expect(screen.getByRole("heading", { name: "Blogs" })).toBeInTheDocument();
    expect(screen.getByText("Archives")).toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBeGreaterThan(3);
  });

  test("links to external profiles", () => {
    render(<Blogs startDate="2024-01-01T00:00:00" />);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/getPiyush"
    );
    expect(screen.getByRole("link", { name: "Twitter" })).toHaveAttribute(
      "href",
      "https://twitter.com/getPiyush"
    );
  });
});
