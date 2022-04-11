import { Link, useLocation } from "react-router-dom";
import ConfirmationButton from "./components/editor/ConfirmationButton";

type HeaderProps = {
  onLogout: () => void;
};

export default function Header({ onLogout }: HeaderProps) {
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
        <div className="collapse navbar-collapse header-links" id="navbarNav">
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
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location === "/admin/contacts" ? "active" : ""
                }`}
                aria-current="page"
                to="/admin/contacts"
              >
                Contacts
              </Link>
            </li>
          </ul>
          <ConfirmationButton
              buttonText="Logout"
              confirmationClick={onLogout}
              confirmationMessage="Are you sure want to log out?"
              iconComp={<i className="bi bi-x-square-fill"/>}
              disabled={false}
            />
        </div>
      </div>
    </nav>
  );
}
