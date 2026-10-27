import { render as rtlRender, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { TemplateRenderer, parseTemplateArticleIds, getTemplateHeading } from "./TemplateRenderer";

const articles = [
  {
    id: "article-001",
    author: "Mina",
    title: "Shipping with confidence",
    createdAt: new Date("2024-04-20T09:00:00Z"),
    updatedAt: new Date("2024-04-21T12:30:00Z"),
    categryId: "Product",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [],
  },
];

// Rendered articles contain react-router <Link>s, which need a router around them.
const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: MemoryRouter });

describe("parseTemplateArticleIds", () => {
  test("splits on commas, pipes and newlines and drops empty entries", () => {
    expect(parseTemplateArticleIds("a,b|c\nd,,")).toEqual(["a", "b", "c", "d"]);
  });

  test("skips heading lines", () => {
    expect(parseTemplateArticleIds("# Featured\na\n## More reading\nb|c")).toEqual(["a", "b", "c"]);
  });
});

describe("TemplateRenderer", () => {
  test("renders a single article as a hero when it is the only column", () => {
    render(
      <TemplateRenderer
        dataString="article-001"
        mode="view"
        articles={articles}
        status="success"
        invalidArticleError={jest.fn()}
      />
    );
    expect(screen.getByText("Shipping with confidence")).toBeInTheDocument();
  });

  test("reports an invalid article id and shows an error card in edit mode", () => {
    const invalidArticleError = jest.fn();
    render(
      <TemplateRenderer
        dataString="missing-id"
        mode="edit"
        articles={articles}
        status="success"
        invalidArticleError={invalidArticleError}
      />
    );
    expect(screen.getByText("Invalid Article")).toBeInTheDocument();
    expect(invalidArticleError).toHaveBeenCalledWith("missing-id", true);
  });

  test("shows a loading card instead of an error while loading", () => {
    render(
      <TemplateRenderer
        dataString="missing-id"
        mode="edit"
        articles={articles}
        status="loading"
        invalidArticleError={jest.fn()}
      />
    );
    expect(screen.getByText(/Please wait while the Article gets loaded/)).toBeInTheDocument();
    expect(screen.queryByText("Invalid Article")).toBeNull();
  });

  test("hides an article that cannot be found in view mode once loading is done", () => {
    const { container } = render(
      <TemplateRenderer
        dataString="missing-id|article-001"
        mode="view"
        articles={articles}
        status="success"
        invalidArticleError={jest.fn()}
      />
    );
    expect(screen.queryByText(/Please wait while the Article gets loaded/)).toBeNull();
    expect(screen.queryByText("Invalid Article")).toBeNull();
    expect(container.querySelectorAll(".container > .row > div")).toHaveLength(1);
  });

  test("shows a loading card in view mode while loading", () => {
    render(
      <TemplateRenderer
        dataString="missing-id"
        mode="view"
        articles={articles}
        status="loading"
        invalidArticleError={jest.fn()}
      />
    );
    expect(screen.getByText(/Please wait while the Article gets loaded/)).toBeInTheDocument();
  });

  test("stacks multi-column rows on small screens and spans single-article rows", () => {
    const { container } = render(
      <TemplateRenderer
        dataString={"article-001\narticle-001|article-001"}
        mode="view"
        articles={articles}
        status="success"
        invalidArticleError={jest.fn()}
      />
    );
    const rows = container.querySelectorAll(".container > .row");
    expect(rows[0].firstElementChild).toHaveClass("col-12");
    expect(rows[0].firstElementChild).not.toHaveClass("col-md-6");
    rows[1].querySelectorAll(":scope > div").forEach((col) => {
      expect(col).toHaveClass("col-12", "col-md-6", "col-lg");
    });
  });

  test("renders heading lines as section headings", () => {
    render(
      <TemplateRenderer
        dataString={"# Featured\narticle-001\n# More reading\narticle-001|article-001"}
        mode="view"
        articles={articles}
        status="success"
        invalidArticleError={jest.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: "Featured" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "More reading" })).toBeInTheDocument();
  });

  test("makes only the first article row a hero; later single rows get a horizontal card", () => {
    const { container } = render(
      <TemplateRenderer
        dataString={"# Featured\narticle-001\narticle-001"}
        mode="view"
        articles={articles}
        status="success"
        invalidArticleError={jest.fn()}
      />
    );
    expect(container.querySelectorAll(".hero-article")).toHaveLength(1);
    expect(container.querySelectorAll(".article-card")).toHaveLength(1);
  });
});

describe("getTemplateHeading", () => {
  test("returns the heading text, or null for an article row", () => {
    expect(getTemplateHeading("# Latest stories ")).toBe("Latest stories");
    expect(getTemplateHeading("a|b")).toBeNull();
  });
});
