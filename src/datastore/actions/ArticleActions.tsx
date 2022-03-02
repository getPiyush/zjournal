import { getArticleByCategoryAPI } from "../api";

export const updatePage = (dispatch, page:string) =>{
    dispatch({ type: "update_page", value: page });
}

export const getArticlesBycategory = (dispatch, category:string) =>{

    getArticleByCategoryAPI(category)
      .then(function (response ) {
        dispatch({ type: "get_article_by_category", value:response.data});
      })
      .catch(function (error) {
        console.log(error);
        dispatch({ type: "get_article_by_category_error" });
      })
      .then(function () {
        // always executed
      });  

    
}