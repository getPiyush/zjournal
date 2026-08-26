import React from "react";
import { months, getMonths } from "../../utils/componentUtil";

type BlogsProps = {
  startDate: string;
  basePath?: string;
};

export default function Blogs({ startDate, basePath = "/web" }: BlogsProps) {
  const monthsYear = getMonths(startDate, new Date().toISOString());

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
                <li key={`${monthY.year}-${monthY.month}`}>
                  <a href={`${basePath}/articles?blogdate=${monthY.year}-${monthY.month<10?'0':''}${monthY.month+1}`}>{`${months[monthY.month]} ${monthY.year}`}</a>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="p-4">
          <span className="fst-italic">Elsewhere</span>
          <ol className="list-unstyled">
            <li>
              <a href="https://github.com/getPiyush">GitHub</a>
            </li>
            <li>
              <a href="https://twitter.com/getPiyush">Twitter</a>
            </li>
            <li>
              <a href="https://www.facebook.com/getPiyush">Facebook</a>
            </li>
          </ol>
        </div>
      </div>
    </React.Fragment>
  );
}
