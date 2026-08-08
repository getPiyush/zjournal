import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ArticleContainerEditor from "./ArticleContainerEditor";

const content = [
  { componenType: "H1", componentId: "h1-1", data: "Editable heading" },
  { componenType: "Paragraph", componentId: "p-1", data: "Editable paragraph" },
];

describe("ArticleContainerEditor", () => {
  test("renders each component wrapped for editing", () => {
    render(<ArticleContainerEditor containerJson={content} componentClicked={jest.fn()} />);

    const heading = screen.getByRole("heading", { name: "Editable heading" });
    expect(heading.closest("#h1-1")).not.toBeNull();
  });

  test("calls componentClicked with the clicked component's id", async () => {
    let clickedId: string | null = null;
    const componentClicked = jest.fn((event) => {
      clickedId = event.currentTarget.id;
    });
    render(<ArticleContainerEditor containerJson={content} componentClicked={componentClicked} />);

    await userEvent.click(screen.getByRole("heading", { name: "Editable heading" }));

    expect(componentClicked).toHaveBeenCalledTimes(1);
    expect(clickedId).toBe("h1-1");
  });
});
