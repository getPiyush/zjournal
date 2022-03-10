import React from "react";
import { applicationProperties, months } from "../../../ApplicationConstants";
import { getMonths } from "../../../utils/componentUtil";

export default function Blogs() {
  const monthsYear = getMonths(
    applicationProperties.startDate,
    new Date().toISOString()
  );

  return (
    <React.Fragment>
      <div className="offcanvas-header">
        <h5>Blogs</h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="p-4">
          <span className="fst-italic">Archives</span>
          <ol className="list-unstyled mb-0">
            {monthsYear.map((monthY) => {
              return (
                <li>
                  <a href={`/web/articles?blogdate=${monthY.year}-${monthY.month<10?'0':''}${monthY.month+1}`}>{`${months[monthY.month]} ${monthY.year}`}</a>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="p-4">
          <span className="fst-italic">Elsewhere</span>
          <ol className="list-unstyled">
            <li>
              <a href="#">GitHub</a>
            </li>
            <li>
              <a href="#">Twitter</a>
            </li>
            <li>
              <a href="#">Facebook</a>
            </li>
          </ol>
        </div>
      </div>
    </React.Fragment>
  );
}
