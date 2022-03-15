import React from "react";
import ReactHtmlParser from "react-html-parser";

import { ArticleT } from "../../../Types";
import { getDate, sliceWords } from "../../../utils/componentUtil";

type ArticleProps = {
  article: ArticleT;
};

export default function HeroArticle({ article }: ArticleProps) {
  let contentArray = [null, null];
  return (
    <div className="card border-light mb-3">
      <div className="card-body">
      <h1>{ReactHtmlParser(article.title)}</h1>
      Created:<b>{getDate(article.dateCreated)}</b>
      <p className="lead">
        {article.content.map((item) => {
          if (item.componenType === "Image" && !contentArray[0]) {
            contentArray[0] = item.data;
            return (
              <img
                className="card-img"
                alt={ReactHtmlParser(article.title)}
                src={`${contentArray[0]}`}
              />
            );
          }

          if (item.componenType === "Paragraph" && !contentArray[1]) {
            contentArray[1] = item.data;
            return (
              <div className="card-text">
                { ReactHtmlParser(sliceWords(contentArray[1],0,200))}
              </div>
            );
          }
        })}
        <div>
          {contentArray[1] && (
            <div>
             { ReactHtmlParser(sliceWords(contentArray[1],200,500))}
              ..
              <a href={`article/${article.id}`}>more..</a>
            </div>
          )}
        </div>
      </p>
      </div>
    </div>
  );
}
