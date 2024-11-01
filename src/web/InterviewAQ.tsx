import React, { useEffect } from "react";
import { parsex } from "../utils/parserUtil";
import { getQnAsDB } from "../datastore/actions/QnAActions";
import { useQnA } from "../datastore/contexts/QnAContext";
import { getUid } from "../utils/componentUtil";
export default function InterviewQA() {
  const { dispatch, state: qnaState } = useQnA();

  const { qnas } = qnaState;
  const reversedQna = [...qnas].reverse();

  useEffect(() => {
    getQnAsDB(dispatch);
  }, []);

  return (
    <div className="qna container">
      <div className="row">
        <div className="col">
          <div className="container">
            <div className="row">
              <div className="col">
                <h4>Interview Questions &amp; Answers</h4>
                <hr />
              </div>
            </div>
            {reversedQna.map((qna, index) => {
              const key = `${qna.id}_${index}_${getUid()}`;
              return (
                <React.Fragment>
                  <div className="row" key={key}>
                    <div className="col">
                      <div>
                        <a
                          data-bs-toggle="collapse"
                          href={`#collapse_${key}`}
                          role="button"
                          aria-expanded="false"
                          aria-controls={`collapse_${key}`}
                          className="btn bg-transparent d-flex"
                        >
                          <h5 style={{textAlign: "start"}}>
                            {index + 1} . {qna.question}
                          </h5>
                        </a>
                      </div>
                      <div>
                        <div className="collapse" id={`collapse_${key}`}>
                          <div className="card card-body">
                            {parsex(qna.answer)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <hr />
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
