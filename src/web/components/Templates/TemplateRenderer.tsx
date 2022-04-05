import { useEffect, useState } from "react";
import { useArticle } from "../../../datastore/contexts/ArticleContext";
import { getArticlesByIds } from "../../../datastore/actions/ArticleActions";
import { getArticleFromId } from "../../../utils/componentUtil";
import ArticleCard from "../Home/ArticleCard";
import HeroArticle from "../Home/HeroArticle";

type TemplateRendererProps = {
  dataString: string;
  invalidArticleError: (articleId: string) => void;
  mode:"view"|"edit";
};

export const TemplateRenderer = ({
  dataString,
  invalidArticleError,
  mode
}: TemplateRendererProps) => {
  const { dispatch, state: articleData } = useArticle();

  const [rowData, setRowData] = useState([]);

  let articleList = dataString.replace(/[\n|]/g, ",").split(",");

  useEffect(() => {
    getArticlesByIds(dispatch, articleList);
  }, [dataString]);

  useEffect(() => {
    if (articleData.status === "success") {
      setRowData(dataString.split("\n"));
    }
  }, [articleData]);

  const invalidArticle = (id) => (
    <div className="card border-danger mb-3">
      <div className="card-body text-danger">
        <h5 className="card-title">Invalid Article</h5>
        <p className="card-text">
          The article id : <b>{id}</b> is invald/corrupt, <br />
          Please use a valid article id.
        </p>
      </div>
    </div>
  );

  return (
    <div className="container">
      {rowData.length > 0 &&
        rowData.map((row, index) => {
          const columnData = row.split("|");
          const { articles } = articleData;
          return (
            <div className="row">
              {columnData.map((articleId, colIndex) => {
                const article = getArticleFromId(articleId, articles);
                let articleComp = mode==="edit"?invalidArticle(articleId):<div>Loading Articles ...</div>;
                if (article && article.id) {
                  articleComp =
                    index === 0 && columnData.length === 1 ? (
                      <HeroArticle mode={mode} article={article} />
                    ) : (
                      <ArticleCard  mode={mode} article={article} />
                    );
                } else {
                  invalidArticleError(articleId);
                }
                return <div className="col">{articleComp}</div>;
              })}
            </div>
          );
        })}
    </div>
  );
};
