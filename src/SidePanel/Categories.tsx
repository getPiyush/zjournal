import React from "react";

export default function Categories() {
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
        <ul>
          <li>
            <a href="#">Production</a>
          </li>
          <li>
            <a href="#">Quality Assurance</a>
          </li>
          <li>
            <a href="#">Engineering</a>
          </li>
          <li>
            <a href="#">Validation and Qualification</a>
          </li>
          <li>
            <a href="#">Microbiology Good Manufacturing Practices (GMP)</a>
          </li>
          <li>
            <a href="#">Quality Control</a>
          </li>
        </ul>
      </div>
    </React.Fragment>
  );
}
