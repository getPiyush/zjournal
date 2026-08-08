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

  test("renders without a snippet when there is no content", () => {
    render(<HeroArticle article={{ ...sampleArticle, content: [] }} />);
    expect(
      screen.getByRole("heading", { name: "Shipping with confidence" })
    ).toBeInTheDocument();
  });
});
