import { ArticleT, Journal } from "../../Types";
import { getJournalAPI, updateJournalAPI } from "../api";
import { decryptData } from "../../utils/crypto";

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
        value: decryptData(response.data.zjData),
      });
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "get_journal_error" });
    })
    .then(function () {
      //
    });
};

export const updateJournalinDB = (dispatch, journal: Journal) => {
  dispatch({ type: "update_journal_loading" });
  updateJournalAPI(journal)
    .then(function (response) {
      dispatch({
        type: "update_journal_success",
        value: decryptData(response.data.zjData),
      });
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "update_journal_error" });
    })
    .then(function () {
      // always executed
    });
};
