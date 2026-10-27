import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Footer from "./Footer";
import { applicationProperties } from "../ApplicationConstants";

const renderFooter = () => render(<Footer />, { wrapper: MemoryRouter });

describe("Footer", () => {
  test("renders a copyright notice with the current year and the author", () => {
    renderFooter();
    expect(
      screen.getByText(new RegExp(`${new Date().getFullYear()} ${applicationProperties.author}`))
    ).toBeInTheDocument();
  });

  test("links to the main sections of the site", () => {
    renderFooter();
    expect(screen.getByRole("link", { name: "All articles" })).toHaveAttribute("href", "/web/articles");
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/web/aboutus");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/web/contactus");
    expect(screen.getByRole("link", { name: "Q&A" })).toHaveAttribute("href", "/web/iqa");
  });

  test("shows the development badge outside of production", () => {
    renderFooter();
    // NODE_ENV is "test" while running Jest, so the dev badge should render.
    expect(screen.getByTitle(/development version/)).toBeInTheDocument();
  });
});
