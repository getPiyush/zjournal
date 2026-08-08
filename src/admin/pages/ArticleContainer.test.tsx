import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../datastore/actions/ArticleActions", () => ({
  addArticleToDB: jest.fn(),
  updateArticleinDB: jest.fn(),
}));

import ArticleContainer from "./ArticleContainer";
import { AllProviders } from "../../testUtils/renderWithProviders";
import { defaultArticle } from "../../ApplicationConstants";

describe("admin ArticleContainer", () => {
  test("starts in edit mode for a new article", () => {
    render(
      <AllProviders>
        <ArticleContainer inArticle={defaultArticle} setOutArticle={jest.fn()} />
      </AllProviders>
    );

    expect(screen.getByPlaceholderText("This is a sample title")).toBeInTheDocument();
  });

  test("switches to preview after adding content and clicking Preview", async () => {
    const setOutArticle = jest.fn();
    render(
      <AllProviders>
        <ArticleContainer inArticle={defaultArticle} setOutArticle={setOutArticle} />
      </AllProviders>
    );

    await userEvent.type(
      screen.getByPlaceholderText("This is a sample title"),
      "My draft article"
    );
    await userEvent.click(screen.getByRole("button", { name: /Add$/ }));
    await userEvent.click(screen.getByRole("button", { name: /Preview/ }));

    expect(setOutArticle).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My draft article" })
    );
    expect(
      screen.getByRole("heading", { name: "My draft article" })
    ).toBeInTheDocument();
  });
});
