import { ArticleViewer, SubHeader } from "./Article.styles";

import { parsex } from "../../utils/parserUtil";
import { ArticleT } from "../../Types";
import { getDate } from "../../utils/componentUtil";
import { PageNotFound } from "../PageNotFound";
import LoadingPage from "../Loader/LoadingPage";
import ArticleContainer from "./ArticleContainer";

type ArticleProps = {
  article: ArticleT | null;
  status?: string;
  disableTextSelect?: boolean;
  onBrowseCategories?: () => void;
};

export default function Article({ article, status, disableTextSelect, onBrowseCategories }: ArticleProps) {
  const getNoArticle = () => {
    return status === "loading" ? (
      <LoadingPage />
    ) : (
      <PageNotFound onBrowseCategories={onBrowseCategories} />
    );
  };

  return (
    <ArticleViewer className="container">
      {article && article.title !== "" && !article.deleteFlag ? (
        <ArticleViewer className="container" $disableTextSelect={disableTextSelect}>
          <div className="row">
            <div className="col">
              {" "}
              <h1>{parsex(article.title)}</h1>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {" "}
              <SubHeader>
                <span>
                  By{" "}
                  <a href={`/web/articles?authorId=${encodeURIComponent(article.author)}`}>
                    <b>{article.author}</b>
                  </a>{" "}
                  on {getDate(article.dateCreated)}
                </span>
                <div>
                  <span className="badge bg-success">{article.categryId}</span>
                </div>
              </SubHeader>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {" "}
              <ArticleContainer containerJson={article.content} />
            </div>
          </div>
          {article.dateCreated !== article.dateModified && (
            <div className="row">
              <SubHeader className="col">
                <i>
                  Last Updated on <b>{getDate(article.dateModified)}</b>
                </i>
              </SubHeader>
            </div>
          )}
        </ArticleViewer>
      ) : (
        getNoArticle()
      )}
    </ArticleViewer>
  );
}
