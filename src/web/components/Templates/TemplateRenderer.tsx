import { useEffect, useState } from "react";
import { useArticle } from "../../../datastore/contexts/ArticleContext";
import { getArticlesByIds } from "../../../datastore/actions/ArticleActions";
import { getArticleFromId } from "../../../utils/componentUtil";
import ArticleCard from "../Home/ArticleCard";
import HeroArticle from "../Home/HeroArticle";

type TemplateRendererProps = {
  dataString: string;
  invalidArticleError: (articleId: string, flag: boolean) => void;
  mode: "view" | "edit";
};

export const TemplateRenderer = ({
  dataString,
  invalidArticleError,
  mode,
}: TemplateRendererProps) => {
  const { dispatch, state: articleData } = useArticle();

  useEffect(() => {
    const articleList = dataString.replace(/[\n|]/g, ",").split(",");
    getArticlesByIds(dispatch, articleList);
  }, [dataString]);

  const invalidArticleCard = (id) => {
    if (articleData.status === "loading") {
      return articleLoadingCard();
    } else {
      return (
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
    }
  };

  const articleLoadingCard = () => (
    <div className="card border-info mb-3 ">
      <div className="card-body">
        <div className="card-text d-flex justify-content-center">
          <div className="m-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
          <div className="m-3">Please wait while the Article gets loaded..</div>
        </div>
      </div>
    </div>
  );

  const invalidArticleFound = (articleId, flag) => {
    if (articleData.status !== "loading") invalidArticleError(articleId, flag);
  };

  const rowData = dataString.split("\n");

  return (
    <div className="container">
      {rowData.map((row, index) => {
        const columnData = row.split("|");
        const { articles } = articleData;
        return (
          <div className="row">
            {columnData.map((articleId, colIndex) => {
              const article = getArticleFromId(articleId, articles);
              let articleComp =
                mode === "edit"
                  ? invalidArticleCard(articleId)
                  : articleLoadingCard();

              if (article && article.id) {
                invalidArticleFound(articleId, false);
                articleComp =
                  index === 0 && columnData.length === 1 ? (
                    <HeroArticle mode={mode} article={article} />
                  ) : (
                    <ArticleCard mode={mode} article={article} />
                  );
              } else {
                invalidArticleFound(articleId, true);
              }
              return <div className="col">{articleComp}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
};
