import React from "react";
import { Link, useLocation } from "react-router-dom";
import { updatePage } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";
import { Logo } from "./components/Logo";

export default function Header() {
  const {dispatch} = useJournal();
  const location = useLocation().pathname;

  const linkClicked = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target: any = event.target;
    const buttonFlag = target.getAttribute("button-flag");
    updatePage(buttonFlag, dispatch);
  };
  return (
    <header>
      <nav className="navbar navbar-expand-md navbar-light fixed-top">
        <div className="container-fluid">
          <Logo />
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
                    location === "/web/home" ? "active" : ""
                  }`}
                  aria-current="page"
                  to="/web/home"
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
                >
                  About Us
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/web/contactus" ? "active" : ""
                  }`}
                  to="/web/contactus"
                >
                  Contact Us
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/web/iqa" ? "active" : ""
                  }`}
                  to="/web/iqa"
                >
                  Interview Q&amp;A
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
                  Blogs
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
