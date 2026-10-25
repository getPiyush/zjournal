import React from "react";
import { CardImage } from "../../styles/shared";

import { parsex } from "../../utils/parserUtil";

import { ArticleT } from "../../Types";
import { getDate, removeHTML } from "../../utils/componentUtil";
import { highlightHtml } from "../../utils/highlight";
import { ArticleHighlight, highlightWordsFor } from "./articleFilters";

type ArticleProps = {
  data: ArticleT;
  // Marks the searched words in the title, author and snippet.
  highlight?: ArticleHighlight;
  basePath?: string;
};

// The start of the text, cut at the first space after `length` characters.
const snippet = (text: string, length: number) => {
  const end = text.indexOf(" ", length);
  return end === -1 ? text : text.slice(0, end);
};

export default function ArticlePreviewWeb({ data, highlight, basePath = "/web" }: ArticleProps) {
  const contentArray: Array<string | null> = [null, null];
  return (
    <div
      className="card mb-3"
      key={`key_${data.title.replace(/[^A-Z0-9]/gi, "_")}`}
    >
      <div className="card-body">
        <h5 className="card-title">
          <a href={`article/${data.id}`}>{parsex(highlightHtml(data.title, highlightWordsFor(highlight, "title")))}</a>
        </h5>
        <div className="card-text">
          {data.author && (
            <div className="article-author">
              By{" "}
              <a href={`${basePath}/articles?authorId=${encodeURIComponent(data.author)}`}>
                {parsex(highlightHtml(data.author, highlightWordsFor(highlight, "author")))}
              </a>
            </div>
          )}
          <div>
            Created:<b>{getDate(data.createdAt)}</b>{" "}
          </div>
          {data.createdAt !== data.updatedAt && (
            <div>
              Last Updated:
              <b>{getDate(data.updatedAt)}</b>
            </div>
          )}
          {data.content.map((item, index) => {
            if (item.componenType === "Image" && !contentArray[0]) {
              contentArray[0] = typeof item.data === "string" ? item.data : item.data[0] || "";
              return (
                <CardImage
                  key={`articlecomp_${index}_${data.id}`}
                  className="card-img-top"
                  src={`${contentArray[0]}`}
                  alt="..."
                />
              );
            }

            if (item.componenType === "Paragraph" && !contentArray[1]) {
              contentArray[1] = snippet(removeHTML(item.data), 200);
              return (
                <div  key={`articlecomp_${index}_${data.id}`} className="card-text">
                  {parsex(highlightHtml(contentArray[1], highlightWordsFor(highlight, "content")))}...{" "}
                  <a href={`article/${data.id}`}>read more</a>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
