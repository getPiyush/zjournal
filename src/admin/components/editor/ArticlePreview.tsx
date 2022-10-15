import React from "react";
import { useNavigate } from "react-router-dom";
import ReactHtmlParser from "react-html-parser";

import { updateCurrentArticle } from "../../../datastore/actions/JournalActions";
import { useJournal } from "../../../datastore/contexts/JournalContext";
import { ArticleT } from "../../../Types";
import { getDate } from "../../../utils/componentUtil";

type ArticleProps = {
  data: ArticleT;
};

export default function ArticlePreview({ data }: ArticleProps) {
  const { dispatch } = useJournal();
  let navigate = useNavigate();

  const editArticle = () => {
    updateCurrentArticle(data, dispatch);
    navigate("/admin/editor");
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
          <div className="top-action-box">
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
              }}
              className="btn btn-outline-secondary btn-sm"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title="Click to copy to clipboard!"
            >
              id : {data.id}
            </button>
          </div>
          <h5 className="card-title">{ReactHtmlParser(data.title)}</h5>
          <div className="card-text">
            Created:<b>{getDate(data.dateCreated)}</b> | Last Updated:
            <b>{getDate(data.dateModified)}</b>
          </div>
          {data.content.map((item) => {
            if (item.componenType === "Image" && !breaker) {
              breaker = true;
              return (
                <img className="card-img-top" src={`${item.data}`} alt="..." />
              );
            }
          })}

          <a href="#" onClick={editArticle} className="btn btn-primary">
            Edit
          </a>
        </div>
      </div>
    </React.Fragment>
  );
}
