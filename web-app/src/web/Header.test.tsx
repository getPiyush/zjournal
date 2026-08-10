import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Header from "./Header";
import { renderWithProviders } from "../testUtils/renderWithProviders";

jest.mock("../datastore/actions/JournalActions", () => ({
  updatePage: jest.fn(),
}));

import { updatePage } from "../datastore/actions/JournalActions";

describe("web Header", () => {
  test("marks the link matching the current route as active", () => {
    renderWithProviders(<Header />, { route: "/web/aboutus" });

    expect(screen.getByRole("link", { name: "About" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveClass("active");
  });

  test("dispatches updatePage with the clicked section", async () => {
    renderWithProviders(<Header />, { route: "/web/home" });

    await userEvent.click(screen.getByRole("button", { name: "Categories" }));

    expect(updatePage).toHaveBeenCalledWith("categories", expect.any(Function));
  });

  test("navigates home when the logo is clicked", async () => {
    renderWithProviders(<Header />, { route: "/web/aboutus" });

    await userEvent.click(screen.getByText("Article Collections"));

    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("active");
  });
});
