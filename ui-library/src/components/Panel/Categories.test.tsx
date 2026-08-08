import { render, screen } from "@testing-library/react";

import Categories from "./Categories";

describe("Categories", () => {
  test("renders a link for each category", () => {
    render(<Categories categories={["Product", "Design", "Engineering"]} />);

    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Product" })).toHaveAttribute(
      "href",
      "/web/articles?categoryId=Product"
    );
  });

  test("renders no list items when there are no categories", () => {
    render(<Categories categories={[]} />);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
