import type { ArticleT } from "../../types/domain";
import { decryptData } from "../codec";
import { getJournalAPI } from "../api";

export const updatePage = (page: string, dispatch) => {
  dispatch({ type: "update_page", value: page });
};

export const updateCurrentArticle = (article: ArticleT, dispatch) => {
  dispatch({ type: "update_current_article", value: article });
};

export const getJournalFromDB = (dispatch) => {
  dispatch({ type: "get_journal_loading" });
  getJournalAPI()
    .then(function (response) {
      dispatch({
        type: "get_journal_success",
        value: decryptData(response.data),
      });
    })
    .catch(function (error) {
      dispatch({ type: "get_journal_error" });
    });
};
