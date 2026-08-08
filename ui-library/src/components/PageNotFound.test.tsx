import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { PageNotFound } from "./PageNotFound";

describe("PageNotFound", () => {
  test("links Go Home to the site root", () => {
    render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute(
      "href",
      "/web/home"
    );
  });

  test("calls onBrowseCategories when the categories button is clicked", async () => {
    const onBrowseCategories = jest.fn();
    render(
      <MemoryRouter>
        <PageNotFound onBrowseCategories={onBrowseCategories} />
      </MemoryRouter>
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Browse Categories" })
    );

    expect(onBrowseCategories).toHaveBeenCalledTimes(1);
  });
});
