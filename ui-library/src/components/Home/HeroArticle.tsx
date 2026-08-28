import { CardImage } from "../../styles/shared";

import { parsex } from "../../utils/parserUtil";
import { ArticleT } from "../../Types";
import { getDate, removeHTML, sliceWords } from "../../utils/componentUtil";

type HeroProps = {
  article: ArticleT;
  mode?: "view" | "edit";
};

export default function HeroArticle({ article, mode = "view" }: HeroProps) {
  const contentArray: Array<string | null> = [null, null];

  return (
    <div className="card border-light mb-3 hero-article">
      <div className="card-body">
        <h2>{parsex(article.title)}</h2>
        <small>By {article.author} on {getDate(article.createdAt)}</small>
        <div className="lead">
          {article.content.map((item, index) => {
            if (item.componenType === "Image" && !contentArray[0]) {
              contentArray[0] = typeof item.data === "string" ? item.data : item.data[0] || "";
              return (
                <CardImage
                  key={`herocomp_${index}_${article.id}`}
                  className="card-img"
                  alt={article.title}
                  title={article.title}
                  src={`${contentArray[0]}`}
                />
              );
            }

            if (item.componenType === "Paragraph" && !contentArray[1]) {
              contentArray[1] = removeHTML(item.data);
              return (
                <div key={`herocomp_${index}_${article.id}`} className="card-text">
                  {parsex(sliceWords(contentArray[1], 0, 200))}
                </div>
              );
            }

            return null;
          })}

          {contentArray[1] && (
            <div className="card-text">
              {parsex(sliceWords(contentArray[1], 200, 500))}
              ...{" "}
              {mode === "view" && (
                <a className="card-link" href={`article/${article.id}`}>
                  more..
                </a>
              )}
              {mode === "edit" && (
                <a target="_blank" href={`/web/article/${article.id}`}>
                  more..
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      {mode === "edit" && (
        <div className="card-footer mt-2">
          <div className="badge bg-dark">{article.id}</div>
        </div>
      )}
    </div>
  );
}
