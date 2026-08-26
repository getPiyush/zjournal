import { decryptData } from "../codec";
import {
  getArticleByIdAPI,
  getArticleByCategoryAPI,
  getArticleByIdsAPI,
  getArticleByMonthAPI,
  getArticleByAuthorAPI,
} from "../api";

export const getArticleById = (dispatch, id: string) => {
  dispatch({ type: "get_article_by_id_loading" });
  getArticleByIdAPI(id)
    .then(function (response) {
      dispatch({ type: "get_article_by_id", value: decryptData(response.data) });
    })
    .catch(function (error) {
      dispatch({ type: "get_article_by_id_error" });
    });
};

export const getArticlesByIds = (dispatch, ids: string[]) => {
  dispatch({ type: "get_article_by_ids_loading" });
  getArticleByIdsAPI(ids)
    .then(function (response) {
      dispatch({ type: "get_article_by_ids_success", value: decryptData(response.data) });
    })
    .catch(function (error) {
      dispatch({ type: "get_article_by_ids_error" });
    });
};

export const getArticlesBycategory = (dispatch, category: string, web?: boolean) => {
  dispatch({ type: "get_article_by_category_loading" });
  getArticleByCategoryAPI(category, web)
    .then(function (response) {
      dispatch({ type: "get_article_by_category", value: decryptData(response.data) });
    })
    .catch(function (error) {
      dispatch({ type: "get_article_by_category_error" });
    });
};

export const getArticlesByAuthor = (dispatch, author: string, web?: boolean) => {
  dispatch({ type: "get_article_by_author_loading" });
  getArticleByAuthorAPI(author, web)
    .then(function (response) {
      dispatch({ type: "get_article_by_author", value: decryptData(response.data) });
    })
    .catch(function (error) {
      dispatch({ type: "get_article_by_author_error" });
    });
};

export const getArticlesByBlogDate = (dispatch, blogDate: string, web?: boolean) => {
  dispatch({ type: "get_article_by_blog_date_loading" });
  getArticleByMonthAPI(blogDate, web)
    .then(function (response) {
      dispatch({ type: "get_article_by_blog_date", value: decryptData(response.data) });
    })
    .catch(function (error) {
      dispatch({ type: "get_article_by_blog_date_error" });
    });
};
