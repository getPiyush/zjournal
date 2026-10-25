import { useEffect } from "react";
import { parsex } from "@zjournal/ui-library";
import { getQnAsDB } from "../datastore/actions/QnAActions";
import { useQnA } from "../datastore/contexts/QnAContext";
import { applicationProperties } from "../ApplicationConstants";

export default function InterviewQA() {
  const { dispatch, state: qnaState } = useQnA();
  const { qnas, status } = qnaState;

  // The server already filters to published questions; filtering here too drops the context's
  // empty placeholder and anything the admin pages loaded earlier in this tab.
  const publishedQnas = qnas.filter((qna) => qna.published).reverse();
  const loading = status === "" || status === "get_qnas_loading";

  useEffect(() => {
    window.document.title = `Q&A - ${applicationProperties.title}`;
    getQnAsDB(dispatch, true);
  }, []);

  return (
    <div className="qna container">
      <h4>Questions &amp; Answers</h4>
      <hr />
      {status === "get_qnas_error" ? (
        <p className="text-danger">Questions couldn't be loaded. Please try again later.</p>
      ) : loading && publishedQnas.length === 0 ? (
        <p className="text-muted">Loading questions…</p>
      ) : publishedQnas.length === 0 ? (
        <p className="text-muted">No questions have been answered yet.</p>
      ) : (
        <div className="accordion accordion-flush" id="qnaAccordion">
          {publishedQnas.map((qna, index) => {
            const itemId = `qna_${qna.id}`;
            return (
              <div className="accordion-item" key={qna.id}>
                <h5 className="accordion-header" id={`${itemId}_heading`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#${itemId}`}
                    aria-expanded="false"
                    aria-controls={itemId}
                  >
                    {index + 1}. {qna.question}
                  </button>
                </h5>
                <div
                  id={itemId}
                  className="accordion-collapse collapse"
                  aria-labelledby={`${itemId}_heading`}
                >
                  <div className="accordion-body">{parsex(qna.answer)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
