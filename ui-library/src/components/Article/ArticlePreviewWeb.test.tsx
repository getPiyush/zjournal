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

  test("starts the snippet with the paragraph's first word", () => {
    const { container } = render(<ArticlePreviewWeb data={sampleArticle} />);
    expect(container.querySelector("div.card-text > div.card-text")).toHaveTextContent(/^A well-defined release/);
  });

  test("cuts a long snippet at a word boundary", () => {
    const long = { ...sampleArticle, content: [{ componenType: "Paragraph", data: `${"word ".repeat(60)}end` }] };
    const { container } = render(<ArticlePreviewWeb data={long} />);
    const text = container.querySelector("div.card-text > div.card-text")!.textContent!;
    expect(text).toMatch(/^word word/);
    expect(text).not.toContain("end");
    expect(text).toContain("word...");
  });

  test("marks the searched words in the title and snippet", () => {
    const { container } = render(
      <ArticlePreviewWeb data={sampleArticle} highlight={{ words: ["release"], field: "all" }} />
    );
    const marks = Array.from(container.querySelectorAll("mark")).map((mark) => mark.textContent);
    expect(marks).toEqual(["release", "release"]);
    // The link keeps its full name.
    expect(screen.getByRole("link", { name: "Designing a better release workflow" })).toBeInTheDocument();
  });

  test("only marks the part that was searched", () => {
    const { container, rerender } = render(
      <ArticlePreviewWeb data={sampleArticle} highlight={{ words: ["release"], field: "title" }} />
    );
    expect(container.querySelectorAll("h5 mark")).toHaveLength(1);
    expect(container.querySelectorAll("div.card-text mark")).toHaveLength(0);

    rerender(<ArticlePreviewWeb data={sampleArticle} highlight={{ words: ["release"], field: "id" }} />);
    expect(container.querySelectorAll("mark")).toHaveLength(0);
  });

  test("shows the author, linking to their articles", () => {
    render(<ArticlePreviewWeb data={{ ...sampleArticle, author: "Ada Lovelace" }} />);
    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute(
      "href",
      "/web/articles?authorId=Ada%20Lovelace"
    );
    expect(screen.getByText(/^By/)).toBeInTheDocument();
  });

  test("marks the author when the search covers authors", () => {
    const { container, rerender } = render(
      <ArticlePreviewWeb data={sampleArticle} highlight={{ words: ["piy"], field: "author" }} />
    );
    expect(container.querySelector(".article-author mark")).toHaveTextContent("Piy");

    rerender(<ArticlePreviewWeb data={sampleArticle} highlight={{ words: ["piy"], field: "title" }} />);
    expect(container.querySelector(".article-author mark")).toBeNull();
  });

  test("leaves the author line out when there is no author", () => {
    const { container } = render(<ArticlePreviewWeb data={{ ...sampleArticle, author: "" }} />);
    expect(container.querySelector(".article-author")).toBeNull();
  });
});
