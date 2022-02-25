import axios, { AxiosResponse } from "axios";

export const updatePage = (dispatch, page:string) =>{
    dispatch({ type: "update_page", value: page });
}

export const getJournalFromDB = (dispatch) =>{

    axios.get('http://localhost:3004/journal')
      .then(function (response ) {
        dispatch({ type: "update_journal", value:response.data});
      })
      .catch(function (error) {
        console.log(error);
        dispatch({ type: "update_journal_error" });
      })
      .then(function () {
        // always executed
      });  

    
}