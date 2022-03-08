import { ArticleT } from "../../Types";
import {
  getArticleByIdAPI,
  addArticleAPI,
  getArticleByCategoryAPI,
  updateArticleAPI,
} from "../api";

export const getArticleById = (dispatch, id: string) => {
  dispatch({ type: "get_article_by_id_loading" });
  getArticleByIdAPI(id)
    .then(function (response) {
      console.log("response is",response);
      dispatch({ type: "get_article_by_id", value: response.data });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({ type: "get_article_by_id_error" });
    })
    .then(function () {
      // always executed
    });
};

export const getArticlesBycategory = (dispatch, category: string) => {
  dispatch({ type: "get_article_by_category_loading" });
  getArticleByCategoryAPI(category)
    .then(function (response) {
      dispatch({ type: "get_article_by_category", value: response.data });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({ type: "get_article_by_category_error" });
    })
    .then(function () {
      // always executed
    });
};

export const addArticleToDB = (dispatch, article: ArticleT) => {
  dispatch({ type: "add_article_loading" });
  addArticleAPI(article)
    .then(function (response) {
      dispatch({ type: "add_article_success", value: response.data });
    })
    .catch(function (error) {
      console.log(error);
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
      dispatch({ type: "update_article_success", value: response.data });
    })
    .catch(function (error) {
      console.log(error);
      dispatch({ type: "update_article_error" });
    })
    .then(function () {
      // always executed
    });
};
