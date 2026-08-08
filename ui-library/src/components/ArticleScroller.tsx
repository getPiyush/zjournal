import { useState } from "react";
import { ArticleT } from "../Types";
import ArticlePreviewWeb from "./Article/ArticlePreviewWeb";

type ArticleScrollerProps = {
  articles: ArticleT[];
};

export const ArticleScroller = ({ articles }: ArticleScrollerProps) => {
  const [sarticles, setSArticles] = useState<ArticleT[]>([]);

  const addArticles = () => {
    setSArticles([...sarticles, ...articles]);
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
