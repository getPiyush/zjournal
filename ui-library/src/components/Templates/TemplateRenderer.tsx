import styled from "styled-components";

import { ArticleT } from "../../Types";
import { getArticleFromId } from "../../utils/componentUtil";
import ArticleCard from "../Home/ArticleCard";
import HeroArticle from "../Home/HeroArticle";

// A template line starting with "#" is a section heading ("# Latest") rather than article ids.
const headingPattern = /^\s*#+\s*(.*)$/;
export const getTemplateHeading = (line: string): string | null => {
  const match = line.match(headingPattern);
  return match ? match[1].trim() : null;
};

export const parseTemplateArticleIds = (dataString: string): string[] =>
  dataString
    .split("\n")
    .filter((line) => getTemplateHeading(line) === null)
    .join(",")
    .replace(/\|/g, ",")
    .split(",")
    .filter(Boolean);

// Lets the card fill its column, so every card in a row has the same height.
const TemplateCol = styled.div`
  display: flex;
  /* Without this the column won't shrink below its content, so wide rows wrap. */
  min-width: 0;

  > .card {
    flex: 1 1 auto;
    min-width: 0;
  }
`;

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
  // Only the template's first article row can be the hero, and only when it holds one article.
  const firstArticleRow = rowData.findIndex((row) => getTemplateHeading(row) === null);

  return (
    <div className="container">
      {rowData.map((row, index) => {
        const heading = getTemplateHeading(row);
        if (heading !== null) {
          return heading ? (
            <h4 className="template-heading mt-4 mb-3" key={`heading_${index}`}>
              {heading}
            </h4>
          ) : null;
        }

        const columnData = row.split("|");
        // A lone article spans the row; several stack on phones, pair up on tablets and
        // share the row from desktop width.
        const colClass = columnData.length === 1 ? "col-12" : "col-12 col-md-6 col-lg";
        return (
          <div className="row" key={`row_${index}`}>
            {columnData.map((articleId, colIndex) => {
              const article = getArticleFromId(articleId, articles);
              let articleComp =
                mode === "edit"
                  ? invalidArticleCard(articleId)
                  : status === "loading"
                    ? articleLoadingCard()
                    : null;

              if (article && article.id) {
                invalidArticleFound(articleId, false);
                const single = columnData.length === 1;
                articleComp =
                  single && index === firstArticleRow ? (
                    <HeroArticle mode={mode} article={article} />
                  ) : (
                    // Any other article with a row to itself gets a wide, image-beside-text card.
                    <ArticleCard mode={mode} article={article} horizontal={single} />
                  );
              } else {
                invalidArticleFound(articleId, true);
              }

              // Readers never see a slot for an article that could not be found.
              if (!articleComp) return null;

              return (
                <TemplateCol className={colClass} key={`col_${index}_${colIndex}_${articleId}`}>
                  {articleComp}
                </TemplateCol>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
