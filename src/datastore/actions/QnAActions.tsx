import { QnA } from "../../Types";

import { decryptData } from "../../utils/crypto";
import { addQnAAPI, deleteQnAAPI, getQnAsAPI } from "../api";

export const getQnAsDB = (dispatch) => {
  dispatch({ type: "get_qnas_loading" });
  getQnAsAPI()
    .then(function (response) {
      dispatch({ type: "get_qnas_success", value:  decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
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
      dispatch({ type: "add_qna_success", value: decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
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
      dispatch({ type: "delete_qna_success", value: decryptData(response.data) });
      getQnAsDB(dispatch);
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "delete_qna_error" });
    })
    .then(function () {
      // always executed
    });
};
