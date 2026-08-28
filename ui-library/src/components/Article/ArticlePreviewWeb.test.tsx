import { render, screen } from "@testing-library/react";

import ArticlePreviewWeb from "./ArticlePreviewWeb";

const sampleArticle = {
  id: "article-001",
  author: "Piyush",
  title: "Designing a better release workflow",
  createdAt: new Date("2024-05-10T10:30:00Z"),
  updatedAt: new Date("2024-05-12T08:15:00Z"),
  categryId: "Engineering",
  origin: "server" as const,
  published: true,
  deleteFlag: false,
  content: [
    {
      componenType: "Image",
      componentId: "img1",
      data: "https://example.com/image.jpg",
      altText: "Team planning on a whiteboard",
    },
    {
      componenType: "Paragraph",
      componentId: "p1",
      data: "A well-defined release workflow helps teams avoid bottlenecks.",
    },
  ],
};

describe("ArticlePreviewWeb", () => {
  test("links the title to the article page", () => {
    render(<ArticlePreviewWeb data={sampleArticle} />);

    expect(
      screen.getByRole("link", { name: "Designing a better release workflow" })
    ).toHaveAttribute("href", "article/article-001");
  });

  test("renders the first image and a read-more link for the first paragraph", () => {
    render(<ArticlePreviewWeb data={sampleArticle} />);

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/image.jpg"
    );
    expect(screen.getByRole("link", { name: "read more" })).toHaveAttribute(
      "href",
      "article/article-001"
    );
  });

  test("only shows the last-updated line when the article was modified", () => {
    render(<ArticlePreviewWeb data={{ ...sampleArticle, updatedAt: sampleArticle.createdAt }} />);
    expect(screen.queryByText("Last Updated:", { exact: false })).toBeNull();
  });
});
