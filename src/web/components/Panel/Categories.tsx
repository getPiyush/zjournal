import React from "react";
import { useJournal } from "../../../contexts/JournalContext";

export default function Categories() {
  const { state: state } = useJournal();

  console.log(state.journal);
  return (
    <React.Fragment>
      <div className="offcanvas-header">
        <h5>Categories</h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <ol>
          {state?.journal?.categories.length > 0 &&
            state.journal.categories.map((category) => (
              <li>
                <a href="#">{category}</a>
              </li>
            ))}
        </ol>
      </div>
    </React.Fragment>
  );
}
