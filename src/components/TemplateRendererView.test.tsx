import { render, screen } from "@testing-library/react";

jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
}));

import TemplateRendererView from "./TemplateRendererView";
import { AllProviders } from "../testUtils/renderWithProviders";
import { getArticlesByIds } from "../datastore/actions/ArticleActions";

describe("TemplateRendererView", () => {
  test("fetches the referenced articles on mount", () => {
    render(
      <AllProviders>
        <TemplateRendererView
          dataString="a1,a2"
          invalidArticleError={jest.fn()}
          mode="view"
        />
      </AllProviders>
    );

    expect(getArticlesByIds).toHaveBeenCalledWith(expect.any(Function), ["a1", "a2"]);
  });

  test("re-fetches when the data string changes", () => {
    const { rerender } = render(
      <AllProviders>
        <TemplateRendererView
          dataString="a1"
          invalidArticleError={jest.fn()}
          mode="view"
        />
      </AllProviders>
    );

    rerender(
      <AllProviders>
        <TemplateRendererView
          dataString="a2"
          invalidArticleError={jest.fn()}
          mode="view"
        />
      </AllProviders>
    );

    expect(getArticlesByIds).toHaveBeenLastCalledWith(expect.any(Function), ["a2"]);
  });
});
