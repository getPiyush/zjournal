import { render, screen } from "@testing-library/react";

import ArticleCard from "./ArticleCard";

const sampleArticle = {
  id: "article-card-1",
  author: "Mina",
  title: "Shipping with confidence",
  createdAt: new Date("2024-04-20T09:00:00Z"),
  updatedAt: new Date("2024-04-21T12:30:00Z"),
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

describe("ArticleCard", () => {
  test("view mode links to the public article page", () => {
    render(<ArticleCard article={sampleArticle} mode="view" />);
    expect(screen.getByRole("link", { name: "more.." })).toHaveAttribute(
      "href",
      "article/article-card-1"
    );
    expect(screen.queryByText("article-card-1")).toBeNull();
  });

  test("edit mode links to the web preview and shows the article id badge", () => {
    render(<ArticleCard article={sampleArticle} mode="edit" />);
    expect(screen.getByRole("link", { name: "more.." })).toHaveAttribute(
      "href",
      "/web/article/article-card-1"
    );
    expect(screen.getByText("article-card-1")).toBeInTheDocument();
  });

  test("defaults to view mode", () => {
    render(<ArticleCard article={sampleArticle} />);
    expect(screen.getByRole("link", { name: "more.." })).toHaveAttribute(
      "href",
      "article/article-card-1"
    );
  });
});
