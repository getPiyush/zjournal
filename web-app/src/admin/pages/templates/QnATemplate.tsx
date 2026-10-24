import React, { useEffect, useRef, useState } from "react";
import { useQnA } from "../../../datastore/contexts/QnAContext";
import {
  addQnAToDB,
  deleteQnAFromDB,
  getQnAsDB,
} from "../../../datastore/actions/QnAActions";
import { parsex, QnA, ConfirmationButton } from "@zjournal/ui-library";

export const QnATemplate = () => {
  const { dispatch, state: qnaState } = useQnA();

  const { qnas } = qnaState;

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const adding = useRef(false);

  useEffect(() => {
    getQnAsDB(dispatch);
  }, []);

  // Clear the form only once the question is actually added, so a failed add keeps the text.
  useEffect(() => {
    if (!adding.current) return;
    if (qnaState.status === "add_qna_success") {
      adding.current = false;
      setQuestion("");
      setAnswer("");
    } else if (qnaState.status === "add_qna_error") {
      adding.current = false;
    }
  }, [qnaState.status]);

  const qnASubmitted = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const qnAOut: QnA = {
      question,
      answer,
      published: true,
      createdAt: new Date(),
    };
    adding.current = true;
    addQnAToDB(dispatch, qnAOut);
  };

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
  };

  const qnADeleted = (id: string) => {
    deleteQnAFromDB(dispatch, id);
  };

  return (
    <div className="admin-template-about container">
      <form id="qnAForm" onSubmit={qnASubmitted} onReset={resetForm}>
        <div className="row">
          <div className="col">
            <h4>Q &amp; A Template</h4> <hr />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label htmlFor="qna_input_question" className="h5">
              Question
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <input
              id="qna_input_question"
              className="form-control d-flex"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label htmlFor="qna_input_answer" className="h5">
              Answer
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <textarea
              id="qna_input_answer"
              rows={6}
              className="form-control"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              required
            ></textarea>
          </div>
        </div>

        <div className="row">
          <div className="col d-flex p-3 justify-content-between">
            <input
              className="btn btn-primary"
              value="Add"
              type="submit"
              disabled={qnaState.status === "add_qna_loading"}
            />
            <input className="btn btn-danger" value="Reset" type="reset" />
          </div>
        </div>
      </form>
      <hr />

      {qnas.map((qna, index) => {
        // Stable across renders (a random part here re-mounted every row on each render,
        // collapsing any open answer).
        const key = qna.id ?? `unsaved-${index}`;
        return (
          <div className="row" key={key}>
            <div className="col">
              <div>
                <a
                  data-bs-toggle="collapse"
                  href={`#collapse_${key}`}
                  role="button"
                  aria-expanded="false"
                  aria-controls={`collapse_${key}`}
                  className="btn bg-transparent d-flex admin-preview"
                >
                  <h5>
                    {qnas.length - index} . {qna.question}
                  </h5>
                </a>
              </div>
              <div>
                <div className="collapse" id={`collapse_${key}`}>
                  <div className="card card-body admin-preview">
                    {parsex(qna.answer)}{" "}
                  </div>
                </div>
              </div>
              <div>
                <ConfirmationButton
                  confirmationMessage="Are you sure you want to delete this question?"
                  iconComp={null}
                  disabled={!qna.id}
                  buttonText="Delete"
                  confirmationClick={() => qnADeleted(qna.id!)}
                />
                <hr />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
