import { Link } from "react-router-dom";
import { applicationProperties } from "../ApplicationConstants";

const footerLinks = [
  { to: "/web/articles", label: "All articles" },
  { to: "/web/aboutus", label: "About" },
  { to: "/web/contactus", label: "Contact" },
  { to: "/web/iqa", label: "Q&A" },
];

export default function Footer() {
  return (
    <footer className="footer mt-auto py-3">
      <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span className="text-muted small-text">
          &copy; {new Date().getFullYear()} {applicationProperties.author}
          {process.env.NODE_ENV !== "production" && (
            <span
              title="Note : You are currently seeing development version, you might come across some alpha experiences."
              style={{ color: "crimson" }}
            >
              {' {'}<i className="bi bi-bug-fill"></i>{'} '}
            </span>
          )}
        </span>
        <nav aria-label="Footer">
          <ul className="list-inline mb-0 small-text">
            {footerLinks.map(({ to, label }) => (
              <li className="list-inline-item" key={to}>
                <Link className="footer-link" to={to}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
