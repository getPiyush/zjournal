import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SaveButton from "./SaveButton";

const baseArticle = {
  id: "",
  author: "Piyush",
  title: "Draft article",
  dateCreated: new Date("2024-06-01T08:00:00Z"),
  dateModified: new Date("2024-06-01T08:00:00Z"),
  categryId: "Production",
  origin: "local" as const,
  published: false,
  deleteFlag: false,
  content: [{ componenType: "Paragraph", componentId: "p1", data: "Some content" }],
};

describe("SaveButton", () => {
  test("shows Add Article and assigns a server id for a new article", async () => {
    const onSave = jest.fn();
    render(<SaveButton article={baseArticle} onSave={onSave} />);

    expect(screen.getByRole("button", { name: /Add Article/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "server", id: expect.any(String) }),
      true
    );
    expect(onSave.mock.calls[0][0].id).not.toBe("");
  });

  test("shows Update Article and keeps the id for an existing article", async () => {
    const existingArticle = { ...baseArticle, id: "article-1", origin: "server" as const };
    const onSave = jest.fn();
    render(<SaveButton article={existingArticle} onSave={onSave} />);

    expect(screen.getByRole("button", { name: /Update Article/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button"));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: "article-1" }),
      false
    );
  });

  test("is disabled without a title or content", () => {
    render(<SaveButton article={{ ...baseArticle, title: "" }} onSave={jest.fn()} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
