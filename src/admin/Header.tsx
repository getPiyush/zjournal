import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation().pathname;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img
            width="50px"
            style={{ padding: "8px" }}
            src="/images/favicons/apple-touch-icon-57x57-precomposed.png"
          />
          Admin Panel
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location === "/admin/categories" ? "active" : ""
                }`}
                aria-current="page"
                to="/admin/categories"
              >
                Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location === "/admin/templates" ? "active" : ""
                }`}
                aria-current="page"
                to="/admin/templates"
              >
                Templates
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location === "/admin/editor" ? "active" : ""
                }`}
                aria-current="page"
                to="/admin/editor"
              >
                Editor
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
