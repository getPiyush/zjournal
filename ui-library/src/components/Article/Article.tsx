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
    <div className="container article-viewer">
      {article && article.title !== "" && !article.deleteFlag ? (
        <div className={`container article-viewer ${disableTextSelect ? "disable-text-selection" : ""}`}>
          <div className="row">
            <div className="col">
              {" "}
              <h1>{parsex(article.title)}</h1>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {" "}
              <div className="sub-header">
                <span>
                  By <b>{article.author}</b> on {getDate(article.dateCreated)}
                </span>
                <div>
                  <span className="badge bg-success">{article.categryId}</span>
                </div>
              </div>
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
              <div className="col sub-header">
                <i>
                  Last Updated on <b>{getDate(article.dateModified)}</b>
                </i>
              </div>
            </div>
          )}
        </div>
      ) : (
        getNoArticle()
      )}
    </div>
  );
}
