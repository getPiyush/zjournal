import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Articles from "./Articles";

const sampleArticles = [
  {
    id: "article-001",
    author: "Mina",
    title: "Shipping with confidence",
    dateCreated: new Date("2024-04-20T09:00:00Z"),
    dateModified: new Date("2024-04-21T12:30:00Z"),
    categryId: "Product",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [],
  },
];

describe("Articles", () => {
  test("renders the title and each article preview on success", () => {
    render(<Articles title="Product" status="success" articles={sampleArticles} />);

    expect(screen.getByRole("heading", { name: /Product Articles/ })).toBeInTheDocument();
    expect(screen.getByText("Shipping with confidence")).toBeInTheDocument();
  });

  test("shows a loading page while loading", () => {
    const { container } = render(<Articles title="Product" status="loading" articles={[]} />);
    expect(container.querySelector(".blob-1")).not.toBeNull();
  });

  test("shows the not-found page on error", () => {
    render(
      <MemoryRouter>
        <Articles title="Product" status="error" articles={[]} />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });

  test("shows the not-found page when there are no articles", () => {
    render(
      <MemoryRouter>
        <Articles title="Product" status="success" articles={[]} />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });
});
