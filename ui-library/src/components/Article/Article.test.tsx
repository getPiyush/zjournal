import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Article from "./Article";

const sampleArticle = {
  id: "article-002",
  author: "Mina",
  title: "Shipping with confidence",
  dateCreated: new Date("2024-04-20T09:00:00Z"),
  dateModified: new Date("2024-04-21T12:30:00Z"),
  categryId: "Product",
  origin: "server" as const,
  published: true,
  deleteFlag: false,
  content: [
    {
      componenType: "Paragraph",
      componentId: "p1",
      data: "A simple plan, clear ownership, and a calm rollout made this release feel effortless.",
    },
  ],
};

describe("Article", () => {
  test("renders the article title, author and content", () => {
    render(<Article article={sampleArticle} status="success" />);

    expect(
      screen.getByRole("heading", { name: "Shipping with confidence" })
    ).toBeInTheDocument();
    expect(screen.getByText("Mina")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
  });

  test("links the author name to their articles page", () => {
    render(<Article article={sampleArticle} status="success" />);

    expect(screen.getByRole("link", { name: "Mina" })).toHaveAttribute(
      "href",
      "/web/articles?authorId=Mina"
    );
  });

  test("shows a loading page while the status is loading", () => {
    render(<Article article={null} status="loading" />);
    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
  });

  test("shows the not-found page when there is no article", () => {
    render(
      <MemoryRouter>
        <Article article={null} status="error" />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });

  test("shows the not-found page for a deleted article", () => {
    render(
      <MemoryRouter>
        <Article article={{ ...sampleArticle, deleteFlag: true }} status="success" />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });

  test("shows the last-updated note only when the article was modified", () => {
    render(<Article article={sampleArticle} status="success" />);
    expect(screen.getByText("Last Updated on", { exact: false })).toBeInTheDocument();
  });
});
