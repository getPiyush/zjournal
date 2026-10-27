import { ArticleT } from "@zjournal/ui-library";
import { readResponse } from "../responses";
import { notifyError, notifySuccess } from "../notifications";
import {
  getArticleByIdAPI,
  addArticleAPI,
  getArticleByCategoryAPI,
  updateArticleAPI,
  deleteArticleAPI,
  getArticleByIdsAPI,
  getArticleByMonthAPI,
  getArticleByAuthorAPI,
  getArticlesToDeleteAPI,
  searchArticlesAPI
} from "../api";

export const getArticleById = (dispatch, id: string) => {
  dispatch({ type: "get_article_by_id_loading" });
  getArticleByIdAPI(id)
    .then(function (response) {
      dispatch({ type: "get_article_by_id", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load the article", error);
      dispatch({ type: "get_article_by_id_error" });
    })
    .then(function () {
      // always executed
    });
};

export const getArticlesByIds = (dispatch, ids: string[]) => {
  dispatch({ type: "get_article_by_ids_loading" });
  getArticleByIdsAPI(ids)
    .then(function (response) {
      dispatch({ type: "get_article_by_ids_success", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load articles", error);
      dispatch({ type: "get_article_by_ids_error" });
    })
    .then(function () {
      // always executed
    });
};

export const getArticlesBycategory = (dispatch, category: string, web?: boolean) => {
  dispatch({ type: "get_article_by_category_loading" });
  getArticleByCategoryAPI(category, web)
    .then(function (response) {
      dispatch({ type: "get_article_by_category", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load articles", error);
      dispatch({ type: "get_article_by_category_error" });
    })
    .then(function () {
      // always executed
    });
};


// Only the newest search may update the list: typing fires searches faster than they answer, and
// an older, slower answer must not overwrite a newer one.
let latestSearch = 0;

export const searchArticles = (dispatch, params: Record<string, string>) => {
  const thisSearch = ++latestSearch;
  dispatch({ type: "search_articles_loading" });
  searchArticlesAPI(params)
    .then(function (response) {
      if (thisSearch !== latestSearch) return;
      const { items, total } = readResponse(response);
      dispatch({ type: "search_articles", value: items, total });
    })
    .catch(function (error) {
      if (thisSearch !== latestSearch) return;
      notifyError("Couldn't load articles", error);
      dispatch({ type: "search_articles_error" });
    });
};

export const getArticlesByAuthor = (dispatch, author: string, web?: boolean) => {
  dispatch({ type: "get_article_by_author_loading" });
  getArticleByAuthorAPI(author, web)
    .then(function (response) {
      dispatch({ type: "get_article_by_author", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load articles", error);
      dispatch({ type: "get_article_by_author_error" });
    })
    .then(function () {
      // always executed
    });
};


export const getArticlesByBlogDate = (dispatch, blogDate: string, web?: boolean) => {
  dispatch({ type: "get_article_by_blog_date_loading" });
  getArticleByMonthAPI(blogDate, web)
    .then(function (response) {
      dispatch({ type: "get_article_by_blog_date", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load articles", error);
      dispatch({ type: "get_article_by_blog_date_error" });
    })
    .then(function () {
      // always executed
    });
};


export const getArticlesToDelete = (dispatch) => {
  dispatch({ type: "get_articles_delete_loading" });
  getArticlesToDeleteAPI()
    .then(function (response) {
      dispatch({ type: "get_articles_delete", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load the articles to purge", error);
      dispatch({ type: "get_articles_delete_error" });
    })
    .then(function () {
      // always executed
    });
};


export const addArticleToDB = (dispatch, article: ArticleT) => {
  dispatch({ type: "add_article_loading" });
  addArticleAPI(article)
    .then(function (response) {
      dispatch({ type: "add_article_success", value: readResponse(response) });
      notifySuccess("Article created");
    })
    .catch(function (error) {
      notifyError("Couldn't create the article", error);
      dispatch({ type: "add_article_error" });
    })
    .then(function () {
      // always executed
    });
};

const saveArticleUpdate = (dispatch, article: ArticleT, savedMessage: string, failedMessage: string) => {
  dispatch({ type: "update_article_loading" });
  updateArticleAPI(article)
    .then(function (response) {
      dispatch({ type: "update_article_success", value: readResponse(response) });
      notifySuccess(savedMessage);
    })
    .catch(function (error) {
      notifyError(failedMessage, error);
      dispatch({ type: "update_article_error" });
    })
    .then(function () {
      // always executed
    });
};

export const updateArticleinDB = (dispatch, article: ArticleT) =>
  saveArticleUpdate(dispatch, article, "Article saved", "Couldn't save the article");

// Takes an article off the purge list.
export const restoreArticleInDB = (dispatch, article: ArticleT) =>
  saveArticleUpdate(
    dispatch,
    { ...article, deleteFlag: false, updatedAt: new Date() },
    "Article restored",
    "Couldn't restore the article"
  );

export const deleteArticleinDB = (dispatch, article: ArticleT) => {
  dispatch({ type: "delete_article_loading" });
  deleteArticleAPI(article)
    .then(function (response) {
      readResponse(response);
      dispatch({ type: "delete_article_success", id: article.id });
      notifySuccess("Article permanently deleted");
    })
    .catch(function (error) {
      notifyError("Couldn't delete the article", error);
      dispatch({ type: "delete_article_error" });
    })
    .then(function () {
      // always executed
    });
};

// Purges several articles at once, with one summary message instead of one per article.
export const deleteArticlesInDB = (dispatch, articles: ArticleT[]) => {
  dispatch({ type: "delete_article_loading" });
  return Promise.allSettled(
    articles.map((article) => deleteArticleAPI(article).then((response) => readResponse(response)))
  ).then((results) => {
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        dispatch({ type: "delete_article_success", id: articles[index].id });
      }
    });
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === "rejected");
    if (failures.length === 0) {
      notifySuccess(`${articles.length} article${articles.length === 1 ? "" : "s"} permanently deleted`);
      return;
    }
    notifyError(`Couldn't delete ${failures.length} of ${articles.length} articles`, failures[0].reason);
    dispatch({ type: "delete_article_error" });
  });
};
