import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Categories from "./Categories";

const renderAt = (route: string, categories: string[]) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Categories categories={categories} />
    </MemoryRouter>
  );

describe("Categories", () => {
  test("renders a link for each category", () => {
    renderAt("/web/home", ["Product", "Design", "Engineering"]);

    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Product" })).toHaveAttribute(
      "href",
      "/web/articles?categoryId=Product"
    );
  });

  test("encodes category names in the link", () => {
    renderAt("/web/home", ["Art & Craft"]);
    expect(screen.getByRole("link", { name: "Art & Craft" })).toHaveAttribute(
      "href",
      "/web/articles?categoryId=Art%20%26%20Craft"
    );
  });

  test("labels All as all articles, linking to the unfiltered list", () => {
    renderAt("/web/home", ["All", "Design"]);
    expect(screen.getByRole("link", { name: "All articles" })).toHaveAttribute("href", "/web/articles");
  });

  test("marks the category being browsed as current", () => {
    renderAt("/web/articles?categoryId=Art%20%26%20Craft", ["All", "Art & Craft", "Design"]);
    expect(screen.getByRole("link", { name: "Art & Craft" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Design" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "All articles" })).not.toHaveAttribute("aria-current");
  });

  test("marks All as current on the unfiltered article list only", () => {
    const { unmount } = renderAt("/web/articles", ["All", "Design"]);
    expect(screen.getByRole("link", { name: "All articles" })).toHaveAttribute("aria-current", "page");
    unmount();

    renderAt("/web/home", ["All", "Design"]);
    expect(screen.getByRole("link", { name: "All articles" })).not.toHaveAttribute("aria-current");
  });

  test("picking a category navigates and closes the panel", async () => {
    const closed = jest.fn();
    render(
      <MemoryRouter initialEntries={["/web/home"]}>
        <Categories categories={["Design"]} />
        <Routes>
          <Route path="/web/articles" element={<p>Design articles</p>} />
          <Route path="*" element={null} />
        </Routes>
      </MemoryRouter>
    );
    screen.getByRole("button", { name: "Close" }).addEventListener("click", closed);

    const link = screen.getByRole("link", { name: "Design" });
    // Bootstrap's dismiss handler cancels clicks on links, which stops Link from navigating.
    expect(link).not.toHaveAttribute("data-bs-dismiss");
    await userEvent.click(link);

    expect(screen.getByText("Design articles")).toBeInTheDocument();
    expect(closed).toHaveBeenCalled();
  });

  test("shows each category's icon, hidden from screen readers", () => {
    renderAt("/web/home", ["All", "Science", "Product"]);
    ["All articles", "Science", "Product"].forEach((name) => {
      const icon = screen.getByRole("link", { name }).querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon?.closest("[aria-hidden='true']")).not.toBeNull();
    });
  });

  test("renders no list items when there are no categories", () => {
    renderAt("/web/home", []);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
