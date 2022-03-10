import React from "react";
import ReactHtmlParser from "react-html-parser";

import { ArticleT } from "../../../Types";
import { getDate, sliceWords } from "../../../utils/componentUtil";

type ArticleProps = {
  data: ArticleT;
};

export default function ArticlePreviewWeb({ data }: ArticleProps) {
  let contentArray = [null,null];
  return (
    <React.Fragment>
      <div
        className="card mb-3"
        key={`key_${data.title.replace(/[^A-Z0-9]/gi, "_")}`}
      >
        <div className="card-body">
          <h5 className="card-title"><a href={`article/${data.id}`}>{ReactHtmlParser(data.title)}</a></h5>
          <div className="card-text">
            Created:<b>{getDate(data.dateCreated)}</b> | Last Updated:
            <b>{getDate(data.dateModified)}</b>
          </div>
          {data.content.map((item) => {
            if (item.componenType === "Image" && !contentArray[0]) {
              contentArray[0] = item.data;
              return (
                <img
                  className="card-img-top"
                  src={`${contentArray[0]}`}
                  alt="..."
                />
              );
            }

            if (item.componenType === "Paragraph" && !contentArray[1]) {
              contentArray[1] =  sliceWords(item.data,0,200);
              return <div className="card-text">{ ReactHtmlParser(contentArray[1])}... <a href={`article/${data.id}`}>read more</a></div>;
            }
          })}
        </div>
      </div>
    </React.Fragment>
  );
}
