import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../datastore/actions/ArticleActions", () => ({
  addArticleToDB: jest.fn(),
  updateArticleinDB: jest.fn(),
}));

import ArticleContainer from "./ArticleContainer";
import { renderWithProviders } from "../../testUtils/renderWithProviders";
import { addArticleToDB } from "../../datastore/actions/ArticleActions";
import { defaultArticle } from "../../ApplicationConstants";

describe("admin ArticleContainer", () => {
  test("starts in edit mode for a new article", () => {
    renderWithProviders(<ArticleContainer inArticle={defaultArticle} setOutArticle={jest.fn()} />, {
      route: "/admin/editor",
    });

    expect(screen.getByPlaceholderText("This is a sample title")).toBeInTheDocument();
  });

  test("switches to preview after adding content and clicking Preview", async () => {
    const setOutArticle = jest.fn();
    renderWithProviders(<ArticleContainer inArticle={defaultArticle} setOutArticle={setOutArticle} />, {
      route: "/admin/editor",
    });

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

  describe("unsaved changes", () => {
    let confirmSpy: jest.SpyInstance;

    beforeEach(() => {
      confirmSpy = jest.spyOn(window, "confirm");
    });
    afterEach(() => confirmSpy.mockRestore());

    const renderEditor = () =>
      renderWithProviders(<ArticleContainer inArticle={defaultArticle} setOutArticle={jest.fn()} />, {
        route: "/admin/editor",
      });

    test("leaves without asking when nothing changed", async () => {
      const { router } = renderEditor();

      await act(() => router.navigate("/admin/categories"));

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(router.state.location.pathname).toBe("/admin/categories");
    });

    test("asks before leaving with unsaved edits, and stays if cancelled", async () => {
      confirmSpy.mockReturnValue(false);
      const { router } = renderEditor();
      await userEvent.type(screen.getByPlaceholderText("This is a sample title"), "Draft");

      await act(() => router.navigate("/admin/categories"));

      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("unsaved changes"));
      expect(router.state.location.pathname).toBe("/admin/editor");
      expect(screen.getByPlaceholderText("This is a sample title")).toHaveValue("Draft");
    });

    test("leaves when the admin confirms", async () => {
      confirmSpy.mockReturnValue(true);
      const { router } = renderEditor();
      await userEvent.type(screen.getByPlaceholderText("This is a sample title"), "Draft");

      await act(() => router.navigate("/admin/categories"));

      expect(router.state.location.pathname).toBe("/admin/categories");
    });

    test("warns on closing the tab only while there are unsaved edits", async () => {
      renderEditor();
      const unloadEvent = () => {
        const event = new Event("beforeunload", { cancelable: true });
        window.dispatchEvent(event);
        return event;
      };

      expect(unloadEvent().defaultPrevented).toBe(false);

      await userEvent.type(screen.getByPlaceholderText("This is a sample title"), "Draft");
      expect(unloadEvent().defaultPrevented).toBe(true);
    });

    test("stops asking once the article is saved, and saving again doesn't duplicate it", async () => {
      // Stand in for the API: report the created article back through the store.
      (addArticleToDB as jest.Mock).mockImplementation((dispatch, article) => {
        dispatch({ type: "add_article_loading" });
        dispatch({ type: "add_article_success", value: { ...article, id: "new-id", origin: "server" } });
      });
      const { router } = renderEditor();

      await userEvent.type(screen.getByPlaceholderText("This is a sample title"), "Draft");
      await userEvent.click(screen.getByRole("button", { name: /Add$/ }));
      await userEvent.click(screen.getByRole("button", { name: /Preview/ }));
      await userEvent.click(screen.getByRole("button", { name: /Add Article/ }));

      expect(addArticleToDB).toHaveBeenCalledTimes(1);
      // The editor now holds the created article, so the next save is an update.
      expect(screen.getByRole("button", { name: /Update Article/ })).toBeInTheDocument();
      await act(() => router.navigate("/admin/categories"));
      expect(confirmSpy).not.toHaveBeenCalled();
      expect(router.state.location.pathname).toBe("/admin/categories");
    });
  });
});
