import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Articles from "./Articles";

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

const twoArticles = [
  sampleArticles[0],
  {
    id: "article-002",
    author: "Jules",
    title: "Designing for the edges",
    dateCreated: new Date("2024-01-02T09:00:00Z"),
    dateModified: new Date("2024-01-02T09:00:00Z"),
    categryId: "Design",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [],
  },
];

describe("Articles", () => {
  test("renders the title and each article preview on success", () => {
    render(<Articles title="Product" status="success" articles={sampleArticles} />);

    expect(screen.getByRole("heading", { name: /Product Articles/ })).toBeInTheDocument();
    expect(screen.getByText("Shipping with confidence")).toBeInTheDocument();
  });

  test("filters articles by title using the search box", async () => {
    const user = userEvent.setup();
    render(<Articles title="Product" status="success" articles={twoArticles} />);

    await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "edges");

    expect(screen.getByText("Designing for the edges")).toBeInTheDocument();
    expect(screen.queryByText("Shipping with confidence")).toBeNull();
  });

  test("shows a message when no article matches the search", async () => {
    const user = userEvent.setup();
    render(<Articles title="Product" status="success" articles={twoArticles} />);

    await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "nothing matches this");

    expect(screen.getByText("No articles match your search.")).toBeInTheDocument();
  });

  test("sorts articles by title when Title A-Z is selected", async () => {
    const user = userEvent.setup();
    render(<Articles title="Product" status="success" articles={twoArticles} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Sort articles" }), "title-asc");

    const titles = screen.getAllByRole("heading", { level: 5 }).map((el) => el.textContent);
    expect(titles).toEqual(["Designing for the edges", "Shipping with confidence"]);
  });

  test("shows a loading page while loading", () => {
    const { container } = render(<Articles title="Product" status="loading" articles={[]} />);
    expect(container.querySelector(".blob-1")).not.toBeNull();
  });

  test("shows the not-found page on error", () => {
    render(
      <MemoryRouter>
        <Articles title="Product" status="error" articles={[]} />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });

  test("shows the not-found page when there are no articles", () => {
    render(
      <MemoryRouter>
        <Articles title="Product" status="success" articles={[]} />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });
});
