import { ArticleT, Journal } from "@zjournal/ui-library";
import { readResponse } from "../responses";
import { notifyError, notifySuccess } from "../notifications";
import { getJournalAPI, updateJournalAPI } from "../api";

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
      dispatch({ type: "get_journal_success", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load the journal settings", error);
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
      dispatch({ type: "update_journal_success", value: readResponse(response) });
      notifySuccess("Changes saved");
    })
    .catch(function (error) {
      notifyError("Couldn't save your changes", error);
      dispatch({ type: "update_journal_error" });
    })
    .then(function () {
      // always executed
    });
};
