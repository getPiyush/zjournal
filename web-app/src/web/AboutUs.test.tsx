import { screen } from "@testing-library/react";

import AboutUs from "./AboutUs";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { JournalLoader } from "../testUtils/JournalLoader";

describe("AboutUs", () => {
  test("renders the page shell when there is no about-us content", () => {
    const { container } = renderWithProviders(<AboutUs />);
    expect(container.querySelector(".about-us")).not.toBeNull();
    expect(container.querySelector(".about-us-intro")).toBeNull();
  });

  test("sets the document title", () => {
    renderWithProviders(<AboutUs />);
    expect(document.title).toContain("About");
  });

  test("renders the admin's about-us HTML", async () => {
    renderWithProviders(
      <>
        <JournalLoader journal={{ aboutUs: "<h4>Hello readers</h4>" }} />
        <AboutUs />
      </>
    );
    expect(await screen.findByText("Hello readers")).toBeInTheDocument();
  });

  test("lists every category except All, linking to its articles", async () => {
    renderWithProviders(
      <>
        <JournalLoader journal={{ categories: ["All", "Space", "Software Development", "Cooking"] }} />
        <AboutUs />
      </>
    );

    const space = await screen.findByRole("link", { name: /Space/ });
    expect(space).toHaveAttribute("href", "/web/articles?categoryId=Space");
    expect(screen.getByRole("link", { name: /Software Development/ })).toHaveAttribute(
      "href",
      "/web/articles?categoryId=Software%20Development"
    );
    // A category with no description still gets a card.
    expect(screen.getByRole("link", { name: "Cooking" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "All" })).toBeNull();
    expect(screen.getByText(/organized into 3 categories/)).toBeInTheDocument();
  });

  test("explains how articles are collected", () => {
    renderWithProviders(<AboutUs />);
    expect(screen.getByRole("heading", { name: "How articles get here" })).toBeInTheDocument();
    expect(screen.getByText(/robots\.txt/)).toBeInTheDocument();
  });
});
