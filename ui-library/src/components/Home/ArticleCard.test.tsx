import { fireEvent, render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ArticleCard from "./ArticleCard";
import { hasCategoryIcon } from "./categoryIcons";

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

// The cards render react-router <Link>s, which need a router around them.
const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: MemoryRouter });

describe("ArticleCard", () => {
  test("view mode links to the public article page", () => {
    render(<ArticleCard article={sampleArticle} mode="view" />);
    expect(screen.getByRole("link", { name: "Read article" })).toHaveAttribute(
      "href",
      "/web/article/article-card-1"
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
    expect(screen.getByRole("link", { name: "Read article" })).toHaveAttribute(
      "href",
      "/web/article/article-card-1"
    );
  });

  test("shows the author, linking to their articles in view mode only", () => {
    const { unmount } = render(<ArticleCard article={sampleArticle} mode="view" />);
    expect(screen.getByRole("link", { name: sampleArticle.author })).toHaveAttribute(
      "href",
      `/web/articles?authorId=${encodeURIComponent(sampleArticle.author)}`
    );
    unmount();

    render(<ArticleCard article={sampleArticle} mode="edit" />);
    expect(screen.queryByRole("link", { name: sampleArticle.author })).toBeNull();
    expect(screen.getByText(sampleArticle.author)).toBeInTheDocument();
  });

  test("shows a byline and the full excerpt without an ellipsis when it is short", () => {
    const { container } = render(<ArticleCard article={sampleArticle} />);
    expect(container.querySelector(".article-author")).toHaveTextContent(/^By Mina · /);
    expect(screen.getByText(sampleArticle.content[0].data as string)).toBeInTheDocument();
  });

  test("cuts a long excerpt at a word boundary and ends it with an ellipsis", () => {
    const long = `${"word ".repeat(80)}end`;
    render(
      <ArticleCard
        article={{ ...sampleArticle, content: [{ componenType: "Paragraph", componentId: "p1", data: long }] }}
      />
    );
    expect(screen.getByText(/^word word .*…$/)).toBeInTheDocument();
  });

  test("puts a lazy, decorative image above the text, or beside it when horizontal", () => {
    const withImage = {
      ...sampleArticle,
      content: [
        { componenType: "Image", componentId: "img1", data: "https://example.com/card.jpg" },
        ...sampleArticle.content,
      ],
    };
    const { container, unmount } = render(<ArticleCard article={withImage} />);
    const image = container.querySelector("img");
    expect(image).toHaveClass("card-img-top");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("loading", "lazy");
    unmount();

    const { container: wide } = render(<ArticleCard article={withImage} horizontal />);
    expect(wide.querySelector(".col-md-4 img")).toBeInTheDocument();
    expect(wide.querySelector(".col-md-8 .card-title")).toBeInTheDocument();
  });

  test("shows a category placeholder when the image is missing, blank or fails to load", () => {
    const withImage = (data: string) => ({
      ...sampleArticle,
      content: [{ componenType: "Image", componentId: "img1", data }, ...sampleArticle.content],
    });
    const { container, unmount } = render(
      <ArticleCard article={withImage("https://example.com/broken.jpg")} horizontal />
    );
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    const placeholder = container.querySelector(".col-md-4 .cover-placeholder");
    expect(placeholder).toHaveTextContent(sampleArticle.categryId);
    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    unmount();

    const { container: blank, unmount: unmountBlank } = render(
      <ArticleCard article={withImage("  ")} />
    );
    expect(blank.querySelector("img")).toBeNull();
    expect(blank.querySelector(".cover-placeholder.card-img-top")).toBeInTheDocument();
    unmountBlank();

    const { container: none } = render(<ArticleCard article={sampleArticle} />);
    expect(none.querySelector(".cover-placeholder")).toBeInTheDocument();
  });

  test("swaps a 1px tracking image for the placeholder", () => {
    const article = {
      ...sampleArticle,
      content: [{ componenType: "Image", componentId: "img1", data: "https://example.com/pixel.gif" }],
    };
    const { container } = render(<ArticleCard article={article} />);
    const image = container.querySelector("img")!;
    Object.defineProperty(image, "naturalWidth", { value: 1 });
    fireEvent.load(image);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".cover-placeholder")).toBeInTheDocument();
  });

  test("the placeholder shows the category's icon, with a generic one for other categories", () => {
    const article = (categryId: string) => ({ ...sampleArticle, categryId, content: [] });
    const { container, unmount } = render(<ArticleCard article={article("Space")} />);
    const placeholder = container.querySelector(".cover-placeholder")!;
    expect(placeholder.querySelector("svg")).toBeInTheDocument();
    expect(placeholder).toHaveTextContent("Space");
    const spaceIcon = placeholder.innerHTML;
    unmount();

    const { container: other } = render(<ArticleCard article={article("Product")} />);
    expect(other.querySelector(".cover-placeholder svg")).toBeInTheDocument();
    expect(other.querySelector(".cover-placeholder")!.innerHTML).not.toEqual(spaceIcon);
  });

  test("every journal category has its own icon", () => {
    [
      "Art", "Engineering", "History", "Mathematics", "Medicine", "Philosophy", "Physics",
      "Psychology", "Science", "Software Development", "Space", "Technology",
    ].forEach((category) => expect(hasCategoryIcon(category)).toBe(true));
    expect(hasCategoryIcon("Product")).toBe(false);
  });
});
