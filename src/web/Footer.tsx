export default function Footer() {
  return (
    <footer className="footer mt-auto py-3">
      <div className="container">
        <span className="text-muted small-text">
          &copy; Copyright 2022, Pharmaceutical Updates by Chandrasekhar Panda.
        </span>
        {process.env.NODE_ENV !== "production" && (
        <span
          title="Note : You are currently seeing development version, you might come across some alpha experiences."
          style={{ color: "crimson" }}
        >
          {' {'}<i className="bi bi-bug-fill"></i>{'} '}
        </span>
      )}
      </div>
    </footer>
  );
}
