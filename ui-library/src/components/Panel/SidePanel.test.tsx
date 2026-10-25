import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SidePanel from "./SidePanel";

describe("SidePanel", () => {
  test("renders the Categories panel when selected", () => {
    // Category links are router links.
    render(
      <MemoryRouter>
        <SidePanel
          selectedPage="categories"
          categories={["Product"]}
          startDate="2024-01-01T00:00:00"
        />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
  });

  test("renders the Blogs panel when selected", () => {
    render(
      <SidePanel selectedPage="blogs" categories={[]} startDate="2024-01-01T00:00:00" />
    );
    expect(screen.getByRole("heading", { name: "Blogs" })).toBeInTheDocument();
  });

  test("renders nothing when there is no selected page", () => {
    const { container } = render(
      <SidePanel categories={["Product"]} startDate="2024-01-01T00:00:00" />
    );
    expect(container.querySelector(".offcanvas-header")).toBeNull();
  });
});
