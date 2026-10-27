import { screen } from "@testing-library/react";

jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
}));

import Home from "./Home";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { JournalLoader } from "../testUtils/JournalLoader";

describe("Home", () => {
  test("sets the document title and renders without crashing", () => {
    renderWithProviders(<Home />);
    expect(document.title).toContain("Home");
  });

  test("introduces the site and links each category, leaving out 'All'", () => {
    renderWithProviders(
      <>
        <JournalLoader journal={{ categories: ["All", "Space", "Software Development"] }} />
        <Home />
      </>
    );

    expect(screen.getByText(/Hand-picked reading/)).toBeInTheDocument();
    const strip = screen.getByRole("navigation", { name: "Browse by category" });
    expect(strip.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Software Development" })).toHaveAttribute(
      "href",
      "/web/articles?categoryId=Software%20Development"
    );
  });
});
