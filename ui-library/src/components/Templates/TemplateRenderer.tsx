import { ArticleT } from "../../Types";
import { getArticleFromId } from "../../utils/componentUtil";
import ArticleCard from "../Home/ArticleCard";
import HeroArticle from "../Home/HeroArticle";

export const parseTemplateArticleIds = (dataString: string): string[] =>
  dataString.replace(/[\n|]/g, ",").split(",").filter(Boolean);

type TemplateRendererProps = {
  dataString: string;
  invalidArticleError: (articleId: string, flag: boolean) => void;
  mode: "view" | "edit";
  articles: ArticleT[];
  status: string;
};

export const TemplateRenderer = ({
  dataString,
  invalidArticleError,
  mode,
  articles,
  status,
}: TemplateRendererProps) => {
  const invalidArticleCard = (id) => {
    if (status === "loading") {
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
    if (status !== "loading") invalidArticleError(articleId, flag);
  };

  const rowData = dataString.split("\n");

  return (
    <div className="container">
      {rowData.map((row, index) => {
        const columnData = row.split("|");
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
