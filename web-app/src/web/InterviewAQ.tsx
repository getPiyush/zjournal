import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { parsex } from "@zjournal/ui-library";
import { getQnAsDB } from "../datastore/actions/QnAActions";
import { useQnA } from "../datastore/contexts/QnAContext";
import { applicationProperties } from "../ApplicationConstants";

// Below this many questions a search box is more clutter than help.
const SEARCH_THRESHOLD = 6;

// Answers are HTML; search their text, not their markup.
const textOf = (html: string = "") => html.replace(/<[^>]*>/g, " ");

export default function InterviewQA() {
  const { dispatch, state: qnaState } = useQnA();
  const { qnas, status } = qnaState;
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  // The server already filters to published questions; filtering here too drops the context's
  // empty placeholder and anything the admin pages loaded earlier in this tab.
  // Item ids include the position, so two questions saved with the same id still open separately.
  const publishedQnas = qnas
    .filter((qna) => qna.published)
    .reverse()
    .map((qna, index) => ({ ...qna, number: index + 1, itemId: `qna_${index + 1}` }));
  const loading = status === "" || status === "get_qnas_loading";

  const needle = query.trim().toLowerCase();
  const visibleQnas = needle
    ? publishedQnas.filter((qna) =>
        `${qna.question} ${textOf(qna.answer)}`.toLowerCase().includes(needle)
      )
    : publishedQnas;
  const allOpen = visibleQnas.length > 0 && visibleQnas.every((qna) => openIds.includes(qna.itemId));

  useEffect(() => {
    window.document.title = `Q&A - ${applicationProperties.title}`;
    getQnAsDB(dispatch, true);
  }, []);

  // A link like /web/qna#qna_2 opens that question once the questions have loaded.
  useEffect(() => {
    const hashId = window.location.hash.slice(1);
    const target = publishedQnas.find((qna) => qna.itemId === hashId);
    if (!target) return;
    setOpenIds((ids) => (ids.includes(hashId) ? ids : [...ids, hashId]));
    document.getElementById(`${hashId}_heading`)?.scrollIntoView?.({ block: "start" });
  }, [publishedQnas.length]);

  const toggle = (itemId: string) => {
    const opening = !openIds.includes(itemId);
    setOpenIds((ids) => (opening ? [...ids, itemId] : ids.filter((id) => id !== itemId)));
    // Keep the address shareable without adding a history entry per click.
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", opening ? `#${itemId}` : `${pathname}${search}`);
  };

  const toggleAll = () =>
    setOpenIds(allOpen ? [] : visibleQnas.map((qna) => qna.itemId));

  return (
    <div className="qna container">
      <h4>Questions &amp; Answers</h4>
      <p className="text-muted">
        Common questions about {applicationProperties.title}: what it is, where the articles come
        from and how it runs.
      </p>

      {status === "get_qnas_error" ? (
        <p className="text-danger">Questions couldn't be loaded. Please try again later.</p>
      ) : loading && publishedQnas.length === 0 ? (
        <p className="text-muted">Loading questions…</p>
      ) : publishedQnas.length === 0 ? (
        <p className="text-muted">No questions have been answered yet.</p>
      ) : (
        <>
          <div className="qna-toolbar d-flex flex-wrap align-items-center gap-2 mb-3">
            {publishedQnas.length >= SEARCH_THRESHOLD && (
              <input
                type="search"
                className="form-control form-control-sm qna-search"
                placeholder="Search questions"
                aria-label="Search questions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            )}
            <button
              type="button"
              className="btn btn-link btn-sm ms-auto px-0"
              onClick={toggleAll}
              disabled={visibleQnas.length === 0}
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>

          {visibleQnas.length === 0 ? (
            <p className="text-muted">No questions match “{query.trim()}”.</p>
          ) : (
            <div className="accordion" id="qnaAccordion">
              {visibleQnas.map((qna) => {
                const { itemId } = qna;
                const open = openIds.includes(itemId);
                return (
                  <div className="accordion-item" key={itemId}>
                    <h5 className="accordion-header" id={`${itemId}_heading`}>
                      <button
                        className={`accordion-button${open ? "" : " collapsed"}`}
                        type="button"
                        aria-expanded={open}
                        aria-controls={itemId}
                        onClick={() => toggle(itemId)}
                      >
                        <span className="qna-number me-2">{qna.number}.</span>
                        {qna.question}
                      </button>
                    </h5>
                    <div
                      id={itemId}
                      className={`accordion-collapse collapse${open ? " show" : ""}`}
                      role="region"
                      aria-labelledby={`${itemId}_heading`}
                    >
                      <div className="accordion-body">{parsex(qna.answer)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <p className="qna-ask small mt-4">
        Didn't find what you were looking for? <Link to="/web/contactus">Ask us a question</Link>.
      </p>
    </div>
  );
}
