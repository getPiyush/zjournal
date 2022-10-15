import ReactHtmlParser from "react-html-parser";

import { useEffect } from "react";
import { getArticlesToDelete, deleteArticleinDB } from "../../datastore/actions/ArticleActions";
import { getDate } from "../../utils/componentUtil";
import { PageTitle } from "../components/PageTitle";
import { useArticle } from "../../datastore/contexts/ArticleContext";
import ConfirmationButton from "../components/editor/ConfirmationButton";
import { ArticleT } from "../../Types";

export const Purge = () => {
  const { dispatch, state: articleState } = useArticle();

  useEffect(() => {
    getArticlesToDelete(dispatch);
  }, []);

  const deleteArticle = (article:ArticleT) => {
    deleteArticleinDB(dispatch, article);
  };

  return (
    <div className="contacts container">
      <div className="row">
        <div className="col">
          <PageTitle title="Articles to be Purged (Deleted Permanently)" />{" "}
        </div>
      </div>
      <div className="row">
        <div className="col">
          {articleState.articles.length > 0 && (
            <div id="articlesToBeDeleted">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Article</th>
                    <th scope="col">Category</th>
                    <th scope="col">Date</th>
                    <th scope="col">Purge</th>
                  </tr>
                </thead>
                <tbody>

              {articleState.articles.map((article, index) => (
                <tr>
                  <th scope="row">{index}</th>
                  <td><b>{ReactHtmlParser(article.title)}</b></td>
                  <td>{article.categryId}</td>
                  <td>{getDate(article.dateCreated)}</td>
                  <td>
                    <ConfirmationButton
                      buttonText=" x "
                      confirmationMessage="Article once purged (deleted permanently) can not be retrived back. Are you sure? "
                      confirmationClick={()=>deleteArticle(article)}
                      iconComp={null}
                      disabled={false}
                    />
                  </td>
                </tr>
              ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
