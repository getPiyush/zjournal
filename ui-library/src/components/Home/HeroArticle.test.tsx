import { render, screen } from "@testing-library/react";

import HeroArticle from "./HeroArticle";

const sampleArticle = {
  id: "article-hero-1",
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
      componenType: "Image",
      componentId: "img1",
      data: "https://example.com/hero.jpg",
    },
    {
      componenType: "Paragraph",
      componentId: "p1",
      data: "A simple plan, clear ownership, and a calm rollout made this release feel effortless.",
    },
  ],
};

describe("HeroArticle", () => {
  test("renders the title, a content snippet and the byline", () => {
    render(<HeroArticle article={sampleArticle} />);

    expect(
      screen.getByRole("heading", { name: "Shipping with confidence" })
    ).toBeInTheDocument();
    // sliceWords drops the first word by design, so the snippet starts mid-sentence.
    expect(screen.getByText(/simple plan/)).toBeInTheDocument();
    expect(screen.getByText("By Mina on", { exact: false })).toBeInTheDocument();
  });

  test("renders the first image from the content", () => {
    render(<HeroArticle article={sampleArticle} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/hero.jpg");
  });

  test("renders without a snippet when there is no content", () => {
    render(<HeroArticle article={{ ...sampleArticle, content: [] }} />);
    expect(
      screen.getByRole("heading", { name: "Shipping with confidence" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "more.." })).toBeNull();
  });

  test("view mode links to the public article page", () => {
    render(<HeroArticle article={sampleArticle} mode="view" />);
    expect(screen.getByRole("link", { name: "more.." })).toHaveAttribute(
      "href",
      "article/article-hero-1"
    );
    expect(screen.queryByText("article-hero-1")).toBeNull();
  });

  test("edit mode links to the web preview and shows the article id badge", () => {
    render(<HeroArticle article={sampleArticle} mode="edit" />);
    expect(screen.getByRole("link", { name: "more.." })).toHaveAttribute(
      "href",
      "/web/article/article-hero-1"
    );
    expect(screen.getByText("article-hero-1")).toBeInTheDocument();
  });

  test("defaults to view mode", () => {
    render(<HeroArticle article={sampleArticle} />);
    expect(screen.getByRole("link", { name: "more.." })).toHaveAttribute(
      "href",
      "article/article-hero-1"
    );
  });
});
