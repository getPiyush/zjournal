import { useEffect, useState } from "react";
import { parsex, getDate, PageTitle, ConfirmationButton, ArticleT } from "@zjournal/ui-library";
import {
  getArticlesToDelete,
  deleteArticleinDB,
  deleteArticlesInDB,
  restoreArticleInDB,
} from "../../datastore/actions/ArticleActions";
import { useArticle } from "../../datastore/contexts/ArticleContext";

export const Purge = () => {
  const { dispatch, state: articleState } = useArticle();

  useEffect(() => {
    getArticlesToDelete(dispatch);
  }, []);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const deleteArticle = (article: ArticleT) => {
    deleteArticleinDB(dispatch, article);
  };

  const restoreArticle = (article: ArticleT) => {
    restoreArticleInDB(dispatch, article);
  };

  // The article list is shared with the other admin pages, so until this page's own fetch
  // lands it may still hold e.g. the Categories page's live articles. Only ever offer to purge
  // articles that are actually flagged for deletion.
  const articles = articleState.articles.filter((article) => article.deleteFlag);
  const loading = articleState.status === "loading";

  // Only count selections that are still on the list (purged or restored ones drop off).
  const selected = articles.filter((article) => selectedIds.has(article.id));
  const allSelected = articles.length > 0 && selected.length === articles.length;

  const toggleSelected = (id: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(articles.map((article) => article.id)));

  const purgeSelected = () => {
    deleteArticlesInDB(dispatch, selected);
    setSelectedIds(new Set());
  };

  return (
    <div className="contacts container">
      <div className="row">
        <div className="col">
          <PageTitle title="Articles to be Purged (Deleted Permanently)" />
        </div>
      </div>
      <div className="row">
        <div className="col">
          {articles.length > 0 && (
            <div id="articlesToBeDeleted">
              <div className="d-flex justify-content-end mb-2">
                <ConfirmationButton
                  buttonText={`Purge selected (${selected.length})`}
                  title="Purge articles"
                  confirmText={`Purge ${selected.length} permanently`}
                  confirmationMessage={`${selected.length} article${
                    selected.length === 1 ? "" : "s"
                  } will be deleted permanently and can't be recovered. Are you sure?`}
                  confirmationClick={purgeSelected}
                  iconComp={<i className="bi bi-trash" />}
                  disabled={selected.length === 0 || loading}
                />
              </div>
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        aria-label="Select all"
                        checked={allSelected}
                        onChange={toggleAll}
                      />
                    </th>
                    <th scope="col">#</th>
                    <th scope="col">Article</th>
                    <th scope="col">Category</th>
                    <th scope="col">Date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, index) => (
                    <tr key={article.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          aria-label={`Select article ${index + 1}`}
                          checked={selectedIds.has(article.id)}
                          onChange={() => toggleSelected(article.id)}
                        />
                      </td>
                      <th scope="row">{index + 1}</th>
                      {/* Titles are stored as HTML (parsex sanitizes it), like everywhere else they're shown. */}
                      <td><b>{parsex(article.title)}</b></td>
                      <td>{article.categryId}</td>
                      <td>{getDate(article.createdAt)}</td>
                      <td className="text-nowrap">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm me-2"
                          onClick={() => restoreArticle(article)}
                          disabled={loading}
                        >
                          <i className="bi bi-arrow-counterclockwise" />
                          &nbsp;Restore
                        </button>
                        <ConfirmationButton
                          buttonText="Purge"
                          title="Purge article"
                          confirmText="Purge permanently"
                          confirmationMessage="An article can't be recovered once it's purged (deleted permanently). Are you sure?"
                          confirmationClick={() => deleteArticle(article)}
                          iconComp={<i className="bi bi-trash" />}
                          disabled={false}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {articles.length === 0 && !loading && (
            <p className="text-muted">
              Nothing to purge. Articles you mark for deletion in the editor show up here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
