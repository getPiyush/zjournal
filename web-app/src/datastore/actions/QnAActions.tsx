import { QnA } from "@zjournal/ui-library";
import { readResponse } from "../responses";
import { notifyError, notifySuccess } from "../notifications";
import { addQnAAPI, deleteQnAAPI, getQnAsAPI } from "../api";

export const getQnAsDB = (dispatch) => {
  dispatch({ type: "get_qnas_loading" });
  getQnAsAPI()
    .then(function (response) {
      dispatch({ type: "get_qnas_success", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load questions", error);
      dispatch({ type: "get_qnas_error" });
    })
    .then(function () {
      // always executed
    });
};

export const addQnAToDB = (dispatch, qna: QnA) => {
  dispatch({ type: "add_qna_loading" });
  addQnAAPI(qna)
    .then(function (response) {
      dispatch({ type: "add_qna_success", value: readResponse(response) });
      notifySuccess("Question added");
    })
    .catch(function (error) {
      notifyError("Couldn't add the question", error);
      dispatch({ type: "add_qna_error" });
    })
    .then(function () {
      // always executed
    });
};

export const deleteQnAFromDB = (dispatch, id:string) => {
  dispatch({ type: "delete_qna_loading" });
 deleteQnAAPI(id)
    .then(function (response) {
      dispatch({ type: "delete_qna_success", value: readResponse(response) });
      notifySuccess("Question deleted");
      getQnAsDB(dispatch);
    })
    .catch(function (error) {
      notifyError("Couldn't delete the question", error);
      dispatch({ type: "delete_qna_error" });
    })
    .then(function () {
      // always executed
    });
};
