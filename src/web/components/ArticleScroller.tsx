import { useState } from "react";
import { useArticle } from "../../datastore/contexts/ArticleContext";
import { getUid } from "../../utils/componentUtil";
import ArticlePreviewWeb from "./Article/ArticlePreviewWeb";

export const ArticleScroller = () => {
  // articles?_sort=dateCreated&_order=desc&_page=11&_limit=5
  const { dispatch, state: articleData } = useArticle();
  const [sarticles, setSArticles] = useState([]);

  const { status, articles } = articleData;

  const addArticles = () => {
    let artArr = [...sarticles];

    artArr.push(...articles);

    setSArticles(artArr);
  };
  return (
    <div className="container">
      {sarticles.map((article, index) => (
        <div className="row">
          <div className="col">
            <ArticlePreviewWeb data={article} />
          </div>
        </div>
      ))}
      <div className="row">
        <div className="col">
          <div className="d-grid gap-2">
            <button  onClick={addArticles} className="btn btn-link" type="button">
              Show More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
