import { render, screen } from "@testing-library/react";

import { TemplateRenderer, parseTemplateArticleIds } from "./TemplateRenderer";

const articles = [
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

describe("parseTemplateArticleIds", () => {
  test("splits on commas, pipes and newlines and drops empty entries", () => {
    expect(parseTemplateArticleIds("a,b|c\nd,,")).toEqual(["a", "b", "c", "d"]);
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
});
