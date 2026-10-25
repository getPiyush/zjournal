jest.mock("../api");
jest.mock("../codec");

import {
  getArticleById,
  getArticlesByIds,
  getArticlesBycategory,
  getArticlesByBlogDate,
  getArticlesByAuthor,
  getArticlesToDelete,
  addArticleToDB,
  updateArticleinDB,
  deleteArticleinDB,
  restoreArticleInDB,
  deleteArticlesInDB,
  searchArticles,
} from "./ArticleActions";
import {
  getArticleByIdAPI,
  getArticleByIdsAPI,
  getArticleByCategoryAPI,
  getArticleByMonthAPI,
  getArticleByAuthorAPI,
  getArticlesToDeleteAPI,
  addArticleAPI,
  updateArticleAPI,
  deleteArticleAPI,
  searchArticlesAPI,
} from "../api";
import { decryptData } from "../codec";
import { ApiError } from "../apiError";
import { Notice, subscribe } from "../notifications";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  jest.clearAllMocks();
  (decryptData as jest.Mock).mockImplementation((data) => data);
});

describe("getArticleById", () => {
  test("dispatches loading then the decrypted article on success", async () => {
    const dispatch = jest.fn();
    (getArticleByIdAPI as jest.Mock).mockResolvedValue({ data: { zjData: "raw" } });
    (decryptData as jest.Mock).mockReturnValue({ id: "1" });

    getArticleById(dispatch, "1");

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_id_loading" });
    await flushPromises();

    expect(getArticleByIdAPI).toHaveBeenCalledWith("1");
    expect(dispatch).toHaveBeenCalledWith({
      type: "get_article_by_id",
      value: { id: "1" },
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getArticleByIdAPI as jest.Mock).mockRejectedValue(new Error("network error"));

    getArticleById(dispatch, "1");
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_id_error" });
  });
});

describe("getArticlesByIds", () => {
  test("dispatches loading then success with decrypted articles", async () => {
    const dispatch = jest.fn();
    (getArticleByIdsAPI as jest.Mock).mockResolvedValue({ data: { zjData: "raw" } });
    (decryptData as jest.Mock).mockReturnValue([{ id: "1" }, { id: "2" }]);

    getArticlesByIds(dispatch, ["1", "2"]);

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_ids_loading" });
    await flushPromises();

    expect(getArticleByIdsAPI).toHaveBeenCalledWith(["1", "2"]);
    expect(dispatch).toHaveBeenCalledWith({
      type: "get_article_by_ids_success",
      value: [{ id: "1" }, { id: "2" }],
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getArticleByIdsAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    getArticlesByIds(dispatch, ["1"]);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_ids_error" });
  });
});

describe("searchArticles", () => {
  test("dispatches loading, then the page of results and the total", async () => {
    const dispatch = jest.fn();
    (searchArticlesAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue({ items: [{ id: "1" }], total: 41, page: 1, limit: 20 });

    searchArticles(dispatch, { q: "mars", view: "public" });

    expect(dispatch).toHaveBeenCalledWith({ type: "search_articles_loading" });
    await flushPromises();
    expect(searchArticlesAPI).toHaveBeenCalledWith({ q: "mars", view: "public" });
    expect(dispatch).toHaveBeenLastCalledWith({ type: "search_articles", value: [{ id: "1" }], total: 41 });
  });

  test("an older search that answers late doesn't overwrite a newer one", async () => {
    const dispatch = jest.fn();
    let answerFirst: (value: unknown) => void = () => {};
    (searchArticlesAPI as jest.Mock)
      .mockReturnValueOnce(new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValueOnce({ data: "second" });
    (decryptData as jest.Mock).mockImplementation((data) =>
      data === "second" ? { items: [{ id: "new" }], total: 1 } : { items: [{ id: "old" }], total: 1 }
    );

    searchArticles(dispatch, { q: "m" });
    searchArticles(dispatch, { q: "mars" });
    await flushPromises();
    answerFirst({ data: "first" });
    await flushPromises();

    const results = dispatch.mock.calls.map(([action]) => action).filter((a) => a.type === "search_articles");
    expect(results).toEqual([{ type: "search_articles", value: [{ id: "new" }], total: 1 }]);
  });

  test("dispatches an error action when the search fails", async () => {
    const dispatch = jest.fn();
    (searchArticlesAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    searchArticles(dispatch, {});
    await flushPromises();

    expect(dispatch).toHaveBeenLastCalledWith({ type: "search_articles_error" });
  });
});

describe("getArticlesBycategory", () => {
  test("dispatches loading then success with the category/web params forwarded", async () => {
    const dispatch = jest.fn();
    (getArticleByCategoryAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue([{ id: "1" }]);

    getArticlesBycategory(dispatch, "Production", true);

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_category_loading" });
    await flushPromises();

    expect(getArticleByCategoryAPI).toHaveBeenCalledWith("Production", true);
    expect(dispatch).toHaveBeenCalledWith({
      type: "get_article_by_category",
      value: [{ id: "1" }],
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getArticleByCategoryAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    getArticlesBycategory(dispatch, "Production");
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_category_error" });
  });
});

describe("getArticlesByBlogDate", () => {
  test("dispatches loading then success", async () => {
    const dispatch = jest.fn();
    (getArticleByMonthAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue([{ id: "1" }]);

    getArticlesByBlogDate(dispatch, "2024-06", false);

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_blog_date_loading" });
    await flushPromises();

    expect(getArticleByMonthAPI).toHaveBeenCalledWith("2024-06", false);
    expect(dispatch).toHaveBeenCalledWith({
      type: "get_article_by_blog_date",
      value: [{ id: "1" }],
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getArticleByMonthAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    getArticlesByBlogDate(dispatch, "2024-06");
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_blog_date_error" });
  });
});

describe("getArticlesByAuthor", () => {
  test("dispatches loading then success with the author/web params forwarded", async () => {
    const dispatch = jest.fn();
    (getArticleByAuthorAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue([{ id: "1" }]);

    getArticlesByAuthor(dispatch, "Mina", true);

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_author_loading" });
    await flushPromises();

    expect(getArticleByAuthorAPI).toHaveBeenCalledWith("Mina", true);
    expect(dispatch).toHaveBeenCalledWith({
      type: "get_article_by_author",
      value: [{ id: "1" }],
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getArticleByAuthorAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    getArticlesByAuthor(dispatch, "Mina");
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_article_by_author_error" });
  });
});

describe("getArticlesToDelete", () => {
  test("dispatches loading then success", async () => {
    const dispatch = jest.fn();
    (getArticlesToDeleteAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue([{ id: "1", deleteFlag: true }]);

    getArticlesToDelete(dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: "get_articles_delete_loading" });
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: "get_articles_delete",
      value: [{ id: "1", deleteFlag: true }],
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getArticlesToDeleteAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    getArticlesToDelete(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_articles_delete_error" });
  });
});

describe("addArticleToDB", () => {
  const article: any = { id: "", title: "New Article" };

  test("dispatches loading then success with the decrypted article", async () => {
    const dispatch = jest.fn();
    (addArticleAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue({ id: "1", title: "New Article" });

    addArticleToDB(dispatch, article);

    expect(dispatch).toHaveBeenCalledWith({ type: "add_article_loading" });
    await flushPromises();

    expect(addArticleAPI).toHaveBeenCalledWith(article);
    expect(dispatch).toHaveBeenCalledWith({
      type: "add_article_success",
      value: { id: "1", title: "New Article" },
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (addArticleAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    addArticleToDB(dispatch, article);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "add_article_error" });
  });
});

describe("updateArticleinDB", () => {
  const article: any = { id: "1", title: "Updated" };

  test("dispatches loading then success", async () => {
    const dispatch = jest.fn();
    (updateArticleAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue(article);

    updateArticleinDB(dispatch, article);

    expect(dispatch).toHaveBeenCalledWith({ type: "update_article_loading" });
    await flushPromises();

    expect(updateArticleAPI).toHaveBeenCalledWith(article);
    expect(dispatch).toHaveBeenCalledWith({
      type: "update_article_success",
      value: article,
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (updateArticleAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    updateArticleinDB(dispatch, article);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "update_article_error" });
  });
});

describe("deleteArticleinDB", () => {
  const article: any = { id: "1", title: "To delete" };

  test("dispatches loading then success", async () => {
    const dispatch = jest.fn();
    (deleteArticleAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue(article);

    deleteArticleinDB(dispatch, article);

    expect(dispatch).toHaveBeenCalledWith({ type: "delete_article_loading" });
    await flushPromises();

    expect(deleteArticleAPI).toHaveBeenCalledWith(article);
    expect(dispatch).toHaveBeenCalledWith({
      type: "delete_article_success",
      id: article.id,
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (deleteArticleAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    deleteArticleinDB(dispatch, article);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "delete_article_error" });
  });
});

describe("feedback", () => {
  let notices: Notice[];
  let unsubscribe: () => void;

  beforeEach(() => {
    notices = [];
    unsubscribe = subscribe((notice) => notices.push(notice));
  });
  afterEach(() => unsubscribe());

  test("announces a successful save", async () => {
    (updateArticleAPI as jest.Mock).mockResolvedValue({ status: 200, data: { id: "1" } });

    updateArticleinDB(jest.fn(), { id: "1" } as any);
    await flushPromises();

    expect(notices).toEqual([expect.objectContaining({ kind: "success", message: "Article saved" })]);
  });

  test("treats an HTTP error status as a failure instead of decrypting it as data", async () => {
    const dispatch = jest.fn();
    (updateArticleAPI as jest.Mock).mockResolvedValue({
      status: 404,
      data: { error: { code: "NOT_FOUND", message: "No item with that id" } },
    });

    updateArticleinDB(dispatch, { id: "missing" } as any);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "update_article_error" });
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: "update_article_success" }));
    expect(notices).toEqual([
      expect.objectContaining({ kind: "error", message: "Couldn't save the article: No item with that id" }),
    ]);
  });

  test("stays quiet when the sign-in was rejected (the sign-in screen explains)", async () => {
    (deleteArticleAPI as jest.Mock).mockRejectedValue(new ApiError(401, "rejected"));

    deleteArticleinDB(jest.fn(), { id: "1" } as any);
    await flushPromises();

    expect(notices).toEqual([]);
  });
});

describe("restoreArticleInDB", () => {
  test("saves the article with its delete flag cleared", async () => {
    const notices: Notice[] = [];
    const unsubscribe = subscribe((notice) => notices.push(notice));
    (updateArticleAPI as jest.Mock).mockResolvedValue({ status: 200, data: { id: "1" } });

    restoreArticleInDB(jest.fn(), { id: "1", deleteFlag: true } as any);
    await flushPromises();
    unsubscribe();

    expect(updateArticleAPI).toHaveBeenCalledWith(expect.objectContaining({ id: "1", deleteFlag: false }));
    expect(notices).toEqual([expect.objectContaining({ kind: "success", message: "Article restored" })]);
  });
});

describe("deleteArticlesInDB", () => {
  let notices: Notice[];
  let unsubscribe: () => void;
  const articles = [{ id: "a" }, { id: "b" }, { id: "c" }] as any[];

  beforeEach(() => {
    notices = [];
    unsubscribe = subscribe((notice) => notices.push(notice));
  });
  afterEach(() => unsubscribe());

  test("deletes every article and reports once", async () => {
    const dispatch = jest.fn();
    (deleteArticleAPI as jest.Mock).mockResolvedValue({ status: 200, data: {} });

    await deleteArticlesInDB(dispatch, articles);

    expect(deleteArticleAPI).toHaveBeenCalledTimes(3);
    ["a", "b", "c"].forEach((id) =>
      expect(dispatch).toHaveBeenCalledWith({ type: "delete_article_success", id })
    );
    expect(notices).toEqual([
      expect.objectContaining({ kind: "success", message: "3 articles permanently deleted" }),
    ]);
  });

  test("removes the ones that succeeded and reports the ones that failed", async () => {
    const dispatch = jest.fn();
    (deleteArticleAPI as jest.Mock).mockImplementation((article) =>
      Promise.resolve(
        article.id === "b"
          ? { status: 500, data: { error: { message: "disk full" } } }
          : { status: 200, data: {} }
      )
    );

    await deleteArticlesInDB(dispatch, articles);

    expect(dispatch).toHaveBeenCalledWith({ type: "delete_article_success", id: "a" });
    expect(dispatch).toHaveBeenCalledWith({ type: "delete_article_success", id: "c" });
    expect(dispatch).not.toHaveBeenCalledWith({ type: "delete_article_success", id: "b" });
    expect(dispatch).toHaveBeenLastCalledWith({ type: "delete_article_error" });
    expect(notices).toEqual([
      expect.objectContaining({ kind: "error", message: "Couldn't delete 1 of 3 articles: disk full" }),
    ]);
  });
});

