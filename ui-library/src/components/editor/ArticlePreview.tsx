import React from "react";
import { TopActionBox, CardImage } from "../../styles/shared";

import { parsex } from "../../utils/parserUtil";
import { ArticleT } from "../../Types";
import { getDate } from "../../utils/componentUtil";
import { highlightHtml } from "../../utils/highlight";
import { ArticleHighlight, highlightWordsFor } from "../Article/articleFilters";

type ArticlePreviewProps = {
  data: ArticleT;
  onEdit: (article: ArticleT) => void;
  // Marks the searched words in the title, author and id.
  highlight?: ArticleHighlight;
};

export default function ArticlePreview({ data, onEdit, highlight }: ArticlePreviewProps) {
  const editArticle = () => {
    onEdit(data);
  };

  const getPublishedComponent = (published) => {
    if (published) {
      return <span className="badge rounded-pill bg-success">Published</span>;
    }

    return <span className="badge rounded-pill bg-warning">Not Published</span>;
  };

  const getDeletedComponent = (deleted) => {
    return deleted?<span className="badge rounded-pill bg-danger">Deleted</span>:<span></span>;
  };

  let breaker = false;

  return (
    <React.Fragment>
      <div
        className="card mb-3"
        key={`key_${data.title.replace(/[^A-Z0-9]/gi, "_")}`}
      >
        <div className="card-body">
          <TopActionBox>
            <div>{getPublishedComponent(data.published)}</div>
            <div>{getDeletedComponent(data.deleteFlag)}</div>
            <button
              type="button"
              disabled={!navigator.clipboard}
              onClick={() => {
                navigator.clipboard.writeText(data.id).then(
                  () => {
                    console.log("Copy to clipboard successful");
                  },
                  () => {
                    console.log("Error in copying to clipboard!");
                  }
                );
              }
              }
              className="btn btn-outline-secondary btn-sm"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title="Click to copy to clipboard!"
            >
              id : {parsex(highlightHtml(data.id, highlightWordsFor(highlight, "id")))}
            </button>
          </TopActionBox>
          <h5 className="card-title">{parsex(highlightHtml(data.title, highlightWordsFor(highlight, "title")))}</h5>
          {data.author && (
            <div className="card-text article-author">
              By <b>{parsex(highlightHtml(data.author, highlightWordsFor(highlight, "author")))}</b>
            </div>
          )}
          <div className="card-text">
            Created:<b>{getDate(data.createdAt)}</b> | Last Updated:
            <b>{getDate(data.updatedAt)}</b>
          </div>
          {data.content.map((item) => {
            if (item.componenType === "Image" && !breaker) {
              breaker = true;
              return (
                <CardImage className="card-img-top" src={`${item.data}`} alt="..." />
              );
            }
          })}

          <button type="button" onClick={editArticle} className="btn btn-primary">
            Edit
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}
