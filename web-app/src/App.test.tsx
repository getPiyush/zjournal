import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("./datastore/actions/JournalActions", () => ({
  ...jest.requireActual("./datastore/actions/JournalActions"),
  getJournalFromDB: jest.fn(),
}));
jest.mock("./datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
}));

import App from "./App";

describe("App", () => {
  test("injects a Google Fonts stylesheet link for the configured fonts", () => {
    render(
      <MemoryRouter initialEntries={["/web/home"]}>
        <App />
      </MemoryRouter>
    );

    const link = document.querySelector('link[data-google-font-loader="true"]');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("href", expect.stringContaining("fonts.googleapis.com"));
    expect(link).toHaveAttribute("href", expect.stringContaining("Source%20Serif%204"));
  });

  test("renders the routed app content", async () => {
    render(
      <MemoryRouter initialEntries={["/web/home"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});
