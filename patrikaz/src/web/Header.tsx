import React, { Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../remotes/uiLibraryComponents";
import { updatePage } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import { applicationProperties } from "../ApplicationConstants";

export default function Header() {
  const { dispatch } = useJournal();
  const location = useLocation().pathname;
  const navigate = useNavigate();

  const linkClicked = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target: any = event.target;
    const buttonFlag = target.getAttribute("button-flag");
    updatePage(buttonFlag, dispatch);
  };
  return (
    <header>
      <nav className="navbar navbar-expand-md navbar-light fixed-top">
        <div className="container-fluid">
          <Suspense fallback={<span />}>
            <Logo
              image="/images/patrikaz_logo_eng.jpeg"
              subtext={`by ${applicationProperties.author}`}
              onClick={() => navigate("/home")}
            />
          </Suspense>
          <button
            className="btn  btn-sm navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarCollapse"
          >
            <ul className="navbar-nav mb-2 mb-md-0">
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/home" ? "active" : ""
                  }`}
                  aria-current="page"
                  to="/home"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/aboutus" ? "active" : ""
                  }`}
                  aria-current="page"
                  to="/aboutus"
                >
                  About
                </Link>
              </li>
              <li className="nav-item dropdown dropstart">
                <a
                  href="#"
                  role="button"
                  className="nav-link"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasRight"
                  aria-controls="offcanvasRight"
                  onClick={linkClicked}
                  button-flag="categories"
                >
                  Categories
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  role="button"
                  className="nav-link"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasRight"
                  aria-controls="offcanvasRight"
                  onClick={linkClicked}
                  button-flag="blogs"
                >
                  More
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
