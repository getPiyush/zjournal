import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ArticleScroller } from "./ArticleScroller";

const sampleArticles = [
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

describe("ArticleScroller", () => {
  test("shows no articles until Show More is clicked", async () => {
    render(<ArticleScroller articles={sampleArticles} />);

    expect(screen.queryByText("Shipping with confidence")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Show More" }));

    expect(screen.getByText("Shipping with confidence")).toBeInTheDocument();
  });

  test("appends another batch of the same articles on repeated clicks", async () => {
    render(<ArticleScroller articles={sampleArticles} />);

    const showMore = screen.getByRole("button", { name: "Show More" });
    await userEvent.click(showMore);
    await userEvent.click(showMore);

    expect(screen.getAllByText("Shipping with confidence")).toHaveLength(2);
  });
});
