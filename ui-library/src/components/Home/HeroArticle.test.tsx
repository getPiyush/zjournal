import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import HeroArticle from "./HeroArticle";

const sampleArticle = {
  id: "article-hero-1",
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

// The cards render react-router <Link>s, which need a router around them.
const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: MemoryRouter });

describe("HeroArticle", () => {
  test("renders the title, a content snippet and the byline", () => {
    const { container } = render(<HeroArticle article={sampleArticle} />);

    expect(
      screen.getByRole("heading", { name: "Shipping with confidence" })
    ).toBeInTheDocument();
    expect(screen.getByText(/A simple plan/)).toBeInTheDocument();
    expect(container.querySelector(".article-author")).toHaveTextContent(/^By Mina · /);
  });

  test("renders the first image from the content as a decorative image", () => {
    const { container } = render(<HeroArticle article={sampleArticle} />);
    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", "https://example.com/hero.jpg");
    expect(image).toHaveAttribute("alt", "");
  });

  test("renders without a snippet or image when there is no content, still linking to the article", () => {
    const { container } = render(<HeroArticle article={{ ...sampleArticle, content: [] }} />);
    expect(
      screen.getByRole("heading", { name: "Shipping with confidence" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/simple plan/)).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".cover-placeholder")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read article" })).toBeInTheDocument();
  });

  test("view mode links to the public article page", () => {
    render(<HeroArticle article={sampleArticle} mode="view" />);
    expect(screen.getByRole("link", { name: "Read article" })).toHaveAttribute(
      "href",
      "/web/article/article-hero-1"
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

  test("shows the author, linking to their articles in view mode only", () => {
    const { unmount } = render(<HeroArticle article={sampleArticle} mode="view" />);
    expect(screen.getByRole("link", { name: "Mina" })).toHaveAttribute(
      "href",
      "/web/articles?authorId=Mina"
    );
    unmount();

    render(<HeroArticle article={sampleArticle} mode="edit" />);
    expect(screen.queryByRole("link", { name: "Mina" })).toBeNull();
    expect(screen.getByText("Mina")).toBeInTheDocument();
  });

  test("defaults to view mode", () => {
    render(<HeroArticle article={sampleArticle} />);
    expect(screen.getByRole("link", { name: "Read article" })).toHaveAttribute(
      "href",
      "/web/article/article-hero-1"
    );
  });

  test("shows a category placeholder when the image fails to load", () => {
    const { container } = render(<HeroArticle article={sampleArticle} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".col-md-7 .cover-placeholder")).toHaveTextContent(
      sampleArticle.categryId
    );
  });
});
