import type { ArticleT } from "../../types/domain";

export const updatePage = (page: string, dispatch) => {
  dispatch({ type: "update_page", value: page });
};

export const updateCurrentArticle = (article: ArticleT, dispatch) => {
  dispatch({ type: "update_current_article", value: article });
};
