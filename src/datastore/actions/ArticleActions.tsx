import { ArticleT } from "../../Types";
import { decryptData } from "../../utils/componentUtil";
import {
  getArticleByIdAPI,
  addArticleAPI,
  getArticleByCategoryAPI,
  updateArticleAPI,
  deleteArticleAPI,
  getArticleByIdsAPI,
  getArticleByMonthAPI,
  getArticlesToDeleteAPI
} from "../api";

export const getArticleById = (dispatch, id: string) => {
  dispatch({ type: "get_article_by_id_loading" });
  getArticleByIdAPI(id)
    .then(function (response) {
      dispatch({ type: "get_article_by_id", value:  decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
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
      dispatch({ type: "get_article_by_ids_success", value:  decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
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
      dispatch({ type: "get_article_by_category", value: decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "get_article_by_category_error" });
    })
    .then(function () {
      // always executed
    });
};


export const getArticlesByBlogDate = (dispatch, blogDate: string, web?: boolean) => {
  dispatch({ type: "get_article_by_blog_date_loading" });
  getArticleByMonthAPI(blogDate, web)
    .then(function (response) {
      dispatch({ type: "get_article_by_blog_date", value:  decryptData(response.data)});
    })
    .catch(function (error) {
      // console.log(error);
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
      dispatch({ type: "get_articles_delete", value:  decryptData(response.data)});
    })
    .catch(function (error) {
      // console.log(error);
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
      dispatch({ type: "add_article_success", value: decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "add_article_error" });
    })
    .then(function () {
      // always executed
    });
};

export const updateArticleinDB = (dispatch, article: ArticleT) => {
  dispatch({ type: "update_article_loading" });
  updateArticleAPI(article)
    .then(function (response) {
      dispatch({ type: "update_article_success", value:  decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "update_article_error" });
    })
    .then(function () {
      // always executed
    });
};

export const deleteArticleinDB = (dispatch, article: ArticleT) => {
  dispatch({ type: "delete_article_loading" });
  deleteArticleAPI(article)
    .then(function (response) {
      dispatch({ type: "delete_article_success", value:  decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "delete_article_error" });
    })
    .then(function () {
      // always executed
    });
};
