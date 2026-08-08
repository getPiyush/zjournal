import { render, screen } from "@testing-library/react";

import ArticleContainer from "./ArticleContainer";

const content = [
  { componenType: "H1", componentId: "h1-1", data: "A polished article layout" },
  {
    componenType: "Paragraph",
    componentId: "p-1",
    data: "This content block demonstrates how the article container renders text and structure.",
  },
  {
    componenType: "List",
    componentId: "list-1",
    data: ["Keep it short", "Make it useful", "Add examples"],
    numbered: false,
  },
];

describe("ArticleContainer", () => {
  test("renders each content block from the JSON array", () => {
    render(<ArticleContainer containerJson={content} />);

    expect(
      screen.getByRole("heading", { name: "A polished article layout" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("This content block demonstrates how the article container renders text and structure.")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  test("renders nothing for an empty container", () => {
    const { container } = render(<ArticleContainer containerJson={[]} />);
    expect(container.textContent).toBe("");
  });
});
