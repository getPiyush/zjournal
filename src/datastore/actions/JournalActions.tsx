import { getJournalAPI } from "../api";

export const updatePage = (dispatch, page:string) =>{
    dispatch({ type: "update_page", value: page });
}

export const getJournalFromDB = (dispatch) =>{
  dispatch({ type: "update_journal_loading"});
    getJournalAPI()
      .then(function (response ) {
        dispatch({ type: "update_journal", value:response.data});
      })
      .catch(function (error) {
        console.log(error);
        dispatch({ type: "update_journal_error" });
      })
      .then(function () {
//
      });  

    
}