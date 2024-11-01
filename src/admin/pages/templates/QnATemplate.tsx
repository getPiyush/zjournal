import { useEffect } from "react";
import { parsex } from "../../../utils/parserUtil";

import { useQnA } from "../../../datastore/contexts/QnAContext";
import { getUid } from "../../../utils/componentUtil";
import {
  addQnAToDB,
  deleteQnAFromDB,
  getQnAsDB,
} from "../../../datastore/actions/QnAActions";
import { QnA } from "../../../Types";
import ConfirmationButton from "../../components/editor/ConfirmationButton";

export const QnATemplate = () => {
  const { dispatch, state: qnaState } = useQnA();

  const { qnas } = qnaState;

  useEffect(() => {
    getQnAsDB(dispatch);
  }, []);

  const qnASubmitted = (e) => {
    console.log(e);
    const { target } = e;

    const qnAOut: QnA = {
      question: target[0].value,
      answer: target[1].value,
      published: true,
      dateCreated: new Date(),
    };

    addQnAToDB(dispatch, qnAOut);

    target.reset();

    e.stopPropagation();
    e.preventDefault();
  };

  const qnADeleted = (id) => {
    console.log("deleting article ", id);
    deleteQnAFromDB(dispatch, id);
  };

  return (
    <form id="qnAForm" onSubmit={qnASubmitted}>
      <div className="admin-template-about container">
        <div className="row">
          <div className="col">
            <h4>Q &amp; A Template</h4> <hr />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <h5>Question</h5>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <input
              id="qna_input_question"
              className="form-control d-flex"
              type="text"
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <h5>Answer</h5>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <textarea
              id="qna_input_answer"
              rows={6}
              className="form-control"
              required
            ></textarea>
          </div>
        </div>

        <div className="row">
          <div className="col d-flex p-3 justify-content-between">
            <input className="btn btn-primary" value="Add" type="submit" />
            <input className="btn btn-danger" value="Reset" type="reset" />
            <hr />
          </div>
        </div>

        {qnas.map((qna, index) => {
          const key = `${qna.id}_${index}_${getUid()}`;
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
                    confirmationMessage="Are you sure want to detele?"
                    iconComp={null}
                    disabled={false}
                    buttonText="Delete"
                    confirmationClick={() => qnADeleted(qna.id)}
                  />
                  <hr />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </form>
  );
};
