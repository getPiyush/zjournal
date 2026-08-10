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
} from "../api";
import { decryptData } from "../codec";

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
      value: article,
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
