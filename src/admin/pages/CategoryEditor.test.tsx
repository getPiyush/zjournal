import { screen } from "@testing-library/react";

jest.mock("../../datastore/actions/ArticleActions", () => ({
  getArticlesBycategory: jest.fn(),
}));

import CategoryEditor from "./CategoryEditor";
import { renderWithProviders } from "../../testUtils/renderWithProviders";
import { getArticlesBycategory } from "../../datastore/actions/ArticleActions";

describe("CategoryEditor", () => {
  test("fetches all categories by default and shows the article count", () => {
    renderWithProviders(<CategoryEditor />, { route: "/admin/categories" });

    expect(getArticlesBycategory).toHaveBeenCalledWith(expect.any(Function), "");
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByText(/Articles$/)).toBeInTheDocument();
  });
});
