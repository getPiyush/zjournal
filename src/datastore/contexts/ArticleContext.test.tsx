import { act, renderHook } from "@testing-library/react";

import { ArticleProvider, useArticle } from "./ArticleContext";

function setup() {
  return renderHook(() => useArticle(), {
    wrapper: ({ children }) => <ArticleProvider>{children}</ArticleProvider>,
  });
}

describe("useArticle", () => {
  test("throws when used outside of an ArticleProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useArticle())).toThrow(
      "useArticle must be used within a ArticleProvider"
    );
    consoleError.mockRestore();
  });

  test("starts with the default article and an empty status", () => {
    const { result } = setup();
    expect(result.current.state.status).toBe("");
    expect(result.current.state.articles).toHaveLength(1);
  });

  test.each([
    ["get_article_by_id_loading", "loading"],
    ["get_article_by_id_error", "error"],
    ["get_article_by_ids_loading", "loading"],
    ["get_article_by_ids_error", "error"],
    ["get_article_by_category_loading", "loading"],
    ["get_article_by_category_error", "error"],
    ["get_article_by_blog_date_loading", "loading"],
    ["get_article_by_blog_date_error", "error"],
    ["get_articles_delete_loading", "loading"],
    ["get_articles_delete_error", "error"],
    ["add_article_loading", "loading"],
    ["add_article_error", "error"],
    ["update_article_loading", "loading"],
    ["update_article_success", "success"],
    ["update_article_error", "error"],
    ["delete_article_loading", "loading"],
    ["delete_article_success", "success"],
    ["delete_article_error", "error"],
  ])("%s sets status to %s while preserving the article list", (type, status) => {
    const { result } = setup();
    const articlesBefore = result.current.state.articles;

    act(() => {
      result.current.dispatch({ type } as any);
    });

    expect(result.current.state.status).toBe(status);
    expect(result.current.state.articles).toBe(articlesBefore);
  });

  test("get_article_by_id replaces the article list with a single article", () => {
    const { result } = setup();
    const article: any = { id: "1", title: "Fetched" };

    act(() => {
      result.current.dispatch({ type: "get_article_by_id", value: article });
    });

    expect(result.current.state).toEqual({ status: "success", articles: [article] });
  });

  test("get_article_by_ids_success replaces the article list", () => {
    const { result } = setup();
    const articles: any = [{ id: "1" }, { id: "2" }];

    act(() => {
      result.current.dispatch({ type: "get_article_by_ids_success", value: articles });
    });

    expect(result.current.state).toEqual({ status: "success", articles });
  });

  test("get_article_by_category replaces the article list", () => {
    const { result } = setup();
    const articles: any = [{ id: "1" }];

    act(() => {
      result.current.dispatch({ type: "get_article_by_category", value: articles });
    });

    expect(result.current.state).toEqual({ status: "success", articles });
  });

  test("get_article_by_blog_date replaces the article list", () => {
    const { result } = setup();
    const articles: any = [{ id: "1" }];

    act(() => {
      result.current.dispatch({ type: "get_article_by_blog_date", value: articles });
    });

    expect(result.current.state).toEqual({ status: "success", articles });
  });

  test("get_articles_delete replaces the article list", () => {
    const { result } = setup();
    const articles: any = [{ id: "1", deleteFlag: true }];

    act(() => {
      result.current.dispatch({ type: "get_articles_delete", value: articles });
    });

    expect(result.current.state).toEqual({ status: "success", articles });
  });

  test("add_article_success replaces the article list with the new article", () => {
    const { result } = setup();
    const article: any = { id: "1", title: "New" };

    act(() => {
      result.current.dispatch({ type: "add_article_success", value: article });
    });

    expect(result.current.state).toEqual({
      status: "add_article_success",
      articles: [article],
    });
  });

  test("an unhandled action type throws", () => {
    // React logs the reducer's thrown error to the console even though the test catches it.
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = setup();

    expect(() => {
      act(() => {
        result.current.dispatch({ type: "not_a_real_action" } as any);
      });
    }).toThrow();

    consoleError.mockRestore();
  });
});
