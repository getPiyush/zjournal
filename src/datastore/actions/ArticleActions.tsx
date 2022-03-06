import { ArticleT } from "../../Types";
import {
  addArticleAPI,
  getArticleByCategoryAPI,
  updateArticleAPI,
} from "../api";

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
