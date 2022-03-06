import { addArticleToDB, updateArticleinDB } from "../../datastore/actions/ArticleActions";
import { useArticle } from "../../datastore/contexts/ArticleContext";
import { ArticleT } from "../../Types";

type SaveButtonProps = {
    article:ArticleT
  };
  
  export default function SaveButton({
    article
  }: SaveButtonProps) {

    const { dispatch} = useArticle();


    const saveArticle = () =>{
        if(article.origin==="local"){
            console.log("Adding new Article", article);
            addArticleToDB(dispatch, {...article, origin:"server"});
        }
        else{
            console.log("Updating Article", article);
            updateArticleinDB(dispatch, {...article});
        }
    }

    return (
        <button
        className="btn btn-primary btn-sm"
        disabled={article.title === "" || article.content.length === 0}
        onClick={saveArticle}
      >
        <i className="bi bi-pencil"></i>&nbsp;&nbsp;{article.origin==="local"?'Add Article':'Update'}
      </button>
    );
  }
  