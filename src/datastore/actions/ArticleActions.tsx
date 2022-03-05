import { getArticleByCategoryAPI } from "../api";


export const getArticlesBycategory = (dispatch,category:string) =>{
  dispatch({ type: "get_article_by_category_loading"});
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