import React, { useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@zjournal/ui-library";
import { updatePage } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import { applicationProperties } from "../ApplicationConstants";

declare const bootstrap: any;

export default function Header() {
  const {dispatch} = useJournal();
  const location = useLocation().pathname;
  const navigate = useNavigate();
  const navCollapseRef = useRef<HTMLDivElement>(null);

  const closeMobileNav = () => {
    const collapseEl = navCollapseRef.current;
    if (collapseEl && collapseEl.classList.contains("show")) {
      bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
    }
  };

  const linkClicked = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target: any = event.target;
    const buttonFlag = target.getAttribute("button-flag");
    updatePage(buttonFlag, dispatch);
    closeMobileNav();
  };
  return (
    <header>
      <nav className="navbar navbar-expand-md navbar-light fixed-top">
        <div className="container-fluid">
          <Logo
            image="/images/patrikaz_logo_eng.jpeg"
            subtext={`by ${applicationProperties.author}`}
            onClick={() => navigate("/web/home")}
          />
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
            ref={navCollapseRef}
          >
            <ul className="navbar-nav mb-2 mb-md-0">
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/web/home" ? "active" : ""
                  }`}
                  aria-current="page"
                  to="/web/home"
                  onClick={closeMobileNav}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/web/aboutus" ? "active" : ""
                  }`}
                  aria-current="page"
                  to="/web/aboutus"
                  onClick={closeMobileNav}
                >
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/web/contactus" ? "active" : ""
                  }`}
                  to="/web/contactus"
                  onClick={closeMobileNav}
                >
                  Contact
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/web/iqa" ? "active" : ""
                  }`}
                  to="/web/iqa"
                  onClick={closeMobileNav}
                >
                  Q&amp;A
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
