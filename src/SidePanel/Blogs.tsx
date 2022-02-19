import React from "react";

export default function Blogs() {
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
            <li>
              <a href="#">March 2021</a>
            </li>
            <li>
              <a href="#">February 2021</a>
            </li>
            <li>
              <a href="#">January 2021</a>
            </li>
            <li>
              <a href="#">December 2020</a>
            </li>
            <li>
              <a href="#">November 2020</a>
            </li>
            <li>
              <a href="#">October 2020</a>
            </li>
            <li>
              <a href="#">September 2020</a>
            </li>
            <li>
              <a href="#">August 2020</a>
            </li>
            <li>
              <a href="#">July 2020</a>
            </li>
            <li>
              <a href="#">June 2020</a>
            </li>
            <li>
              <a href="#">May 2020</a>
            </li>
            <li>
              <a href="#">April 2020</a>
            </li>
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
