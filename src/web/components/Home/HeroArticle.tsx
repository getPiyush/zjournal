import React from "react";
import { ArticleT } from "../../../Types";
import { getDate, removeHTML, sliceWords } from "../../../utils/componentUtil";
import { parsex } from "../../../utils/parserUtil";

type ArticleProps = {
  article: ArticleT;
  mode?:"view"|"edit";
};

export default function HeroArticle({ article, mode="view" }: ArticleProps) {
  let contentArray = [null, null];
  return (
    <div className="card border-light mb-3">
      <div className="card-body">
        <h1>{parsex(article.title)}</h1>
        Created:<b>{getDate(article.dateCreated)}</b>
        <div className="lead">
          {article.content.map((item, index) => {
            if (item.componenType === "Image" && !contentArray[0]) {
              contentArray[0] = item.data;
              return (
                <img
                  key={`articlecomp_${index}_${item.componenType}`}
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
                <div
                  key={`articlecomp_${index}_${item.componenType}`}
                  className="card-text"
                >
                  {parsex(sliceWords(contentArray[1], 0, 200))}
                </div>
              );
            }
          })}
          <div>
            {contentArray[1] && (
              <div>
                {parsex(sliceWords(contentArray[1], 200, 500))}
                ..
                {mode==="view" && <a href={`article/${article.id}`}>more..</a>}
                {mode==="edit" && <a target="_blank" href={`/web/article/${article.id}`}>more..</a>}
                {mode==="edit" && <div className="card-footer mt-2"><div className="badge bg-dark">{article.id}</div></div>}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
