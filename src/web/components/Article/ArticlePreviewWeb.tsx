import React from "react";
import { parsex } from "../../../utils/parserUtil";

import { ArticleT } from "../../../Types";
import { getDate, removeHTML, sliceWords } from "../../../utils/componentUtil";

type ArticleProps = {
  data: ArticleT;
};

export default function ArticlePreviewWeb({ data }: ArticleProps) {
  let contentArray = [null, null];
  return (
    <div
      className="card mb-3"
      key={`key_${data.title.replace(/[^A-Z0-9]/gi, "_")}`}
    >
      <div className="card-body">
        <h5 className="card-title">
          <a href={`article/${data.id}`}>{parsex(data.title)}</a>
        </h5>
        <div className="card-text">
          <div>
            Created:<b>{getDate(data.dateCreated)}</b>{" "}
          </div>
          {data.dateCreated !== data.dateModified && (
            <div>
              Last Updated:
              <b>{getDate(data.dateModified)}</b>
            </div>
          )}
          {data.content.map((item, index) => {
            if (item.componenType === "Image" && !contentArray[0]) {
              contentArray[0] = item.data;
              return (
                <img
                  key={`articlecomp_${index}_${data.id}`}
                  className="card-img-top"
                  src={`${contentArray[0]}`}
                  alt="..."
                />
              );
            }

            if (item.componenType === "Paragraph" && !contentArray[1]) {
              contentArray[1] = sliceWords(removeHTML(item.data), 0, 200);
              return (
                <div  key={`articlecomp_${index}_${data.id}`} className="card-text">
                  {parsex(contentArray[1])}...{" "}
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
