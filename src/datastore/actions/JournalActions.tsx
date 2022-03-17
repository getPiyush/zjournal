import { ArticleT } from "../../Types";
import { getJournalAPI } from "../api";
import { decryptData } from "../crypto";

export const updatePage = (page: string, dispatch) => {
  dispatch({ type: "update_page", value: page });
};

export const updateCurrentArticle = (article: ArticleT, dispatch) => {
  dispatch({ type: "update_current_article", value: article });
};

export const getJournalFromDB = (dispatch) => {
  dispatch({ type: "update_journal_loading" });
  getJournalAPI()
    .then(function (response) {
      dispatch({ type: "update_journal", value:  decryptData(response.data.zjData) });
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "update_journal_error" });
    })
    .then(function () {
      //
    });
};
