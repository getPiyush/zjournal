import { render, screen } from "@testing-library/react";

import { PageTitle } from "./PageTitle";

describe("PageTitle", () => {
  test("renders the given title as a heading", () => {
    render(<PageTitle title="Admin: Articles" />);
    expect(
      screen.getByRole("heading", { name: "Admin: Articles" })
    ).toBeInTheDocument();
  });
});
