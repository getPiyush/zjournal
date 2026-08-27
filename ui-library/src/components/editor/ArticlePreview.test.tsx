import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ArticlePreview from "./ArticlePreview";

const sampleArticle = {
  id: "preview-001",
  author: "Nadia",
  title: "A practical editor workflow",
  createdAt: new Date("2024-06-01T08:00:00Z"),
  updatedAt: new Date("2024-06-03T09:30:00Z"),
  categryId: "Editorial",
  origin: "server" as const,
  published: true,
  deleteFlag: false,
  content: [
    {
      componenType: "Image",
      componentId: "img-preview",
      data: "https://example.com/workspace.jpg",
      altText: "Editor workspace",
    },
  ],
};

describe("ArticlePreview", () => {
  test("shows a Published badge and the article id", () => {
    render(<ArticlePreview data={sampleArticle} onEdit={jest.fn()} />);

    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText(/id : preview-001/)).toBeInTheDocument();
  });

  test("shows Not Published and Deleted badges when applicable", () => {
    render(
      <ArticlePreview
        data={{ ...sampleArticle, published: false, deleteFlag: true }}
        onEdit={jest.fn()}
      />
    );

    expect(screen.getByText("Not Published")).toBeInTheDocument();
    expect(screen.getByText("Deleted")).toBeInTheDocument();
  });

  test("calls onEdit with the article when Edit is clicked", async () => {
    const onEdit = jest.fn();
    render(<ArticlePreview data={sampleArticle} onEdit={onEdit} />);

    await userEvent.click(screen.getByRole("link", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledWith(sampleArticle);
  });
});
