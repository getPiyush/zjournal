import React from "react";
import { useNavigate } from "react-router-dom";

import { updateCurrentArticle } from "../../datastore/actions/JournalActions";
import { useJournal } from "../../datastore/contexts/JournalContext";
import { ArticleT } from "../../Types";

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
  let breaker = false;
  return (
    <React.Fragment>
      {data.content.map((item, index) => {
        if (item.componenType === "Image" && !breaker) {
          breaker = true;
          return (
            <div
              className="card mb-3"
              key={`key_${index}_${data.title.replace(/[^A-Z0-9]/gi, "_")}`}
            >
              <div className="card-body">
                <h5 className="card-title">{data.title}</h5>
                <img className="card-img-top" src={`${item.data}`} alt="..." />
                <a href="#" onClick={editArticle} className="btn btn-primary">
                  Edit
                </a>
              </div>
            </div>
          );
        }
      })}
    </React.Fragment>
  );
}
