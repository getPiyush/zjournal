import React from "react";
import { Link, useLocation } from "react-router-dom";

type HeaderProps = {
  updateSideNav: (name: string) => void;
};

export default function Header({ updateSideNav }: HeaderProps) {

  const location = useLocation().pathname;
  const linkClicked = (event: React.MouseEvent<HTMLAnchorElement>) => {
  const target : any = event.target;
  updateSideNav(target.getAttribute("button-flag"));

  };
  return (
    <header>
      <nav className="navbar navbar-expand-md navbar-light fixed-top bg-light">
        <div className="container-fluid">
          <span className="blog-header blog-header-logo">
            Pharmaceutical Updates
            <div className="logo-subtext">by Chandrasekhar Panda</div>
          </span>

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
                  className={`nav-link ${location === "/home" ? "active" : ""}`}
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
                  About Us
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    location === "/contactus" ? "active" : ""
                  }`}
                  to="/contactus"
                >
                  Contact Us
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${location === "/iqa" ? "active" : ""}`}
                  to="/iqa"
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
