import { render } from "@testing-library/react";

jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
}));

import Home from "./Home";
import { AllProviders } from "../testUtils/renderWithProviders";

describe("Home", () => {
  test("sets the document title and renders without crashing", () => {
    render(
      <AllProviders>
        <Home />
      </AllProviders>
    );
    expect(document.title).toContain("Home");
  });
});
