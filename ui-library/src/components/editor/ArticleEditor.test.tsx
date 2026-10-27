import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ArticleEditor from "./ArticleEditor";

const defaultArticle = {
  id: "",
  author: "Piyush",
  title: "",
  createdAt: new Date("2024-06-01T08:00:00Z"),
  updatedAt: new Date("2024-06-01T08:00:00Z"),
  categryId: "Production",
  origin: "local" as const,
  published: false,
  deleteFlag: false,
  content: [],
};

describe("ArticleEditor", () => {
  test("shows 'Creating New' for a local article", () => {
    render(
      <ArticleEditor
        articleIn={defaultArticle}
        defaultArticle={defaultArticle}
        setPreview={jest.fn()}
        availableComponents={["H2", "Paragraph"]}
        categories={["Production"]}
      />
    );

    expect(screen.getByText("Creating New", { exact: false })).toBeInTheDocument();
    expect(screen.queryByTitle("Article id")).not.toBeInTheDocument();
  });

  test("shows 'Updating' for a saved article", () => {
    render(
      <ArticleEditor
        articleIn={{ ...defaultArticle, id: "a1", origin: "server" }}
        defaultArticle={defaultArticle}
        setPreview={jest.fn()}
        availableComponents={["H2", "Paragraph"]}
        categories={["Production"]}
      />
    );

    expect(screen.getByText("Updating", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("id : a1")).toBeInTheDocument();
  });

  test("reports every edit through onChange, starting with the article as given", async () => {
    const onChange = jest.fn();
    render(
      <ArticleEditor
        articleIn={defaultArticle}
        defaultArticle={defaultArticle}
        setPreview={jest.fn()}
        availableComponents={["H2", "Paragraph"]}
        categories={["Production"]}
        onChange={onChange}
      />
    );

    expect(onChange).toHaveBeenLastCalledWith(defaultArticle);

    await userEvent.type(screen.getByPlaceholderText("This is a sample title"), "Hi");

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Hi", content: [] }));
  });

  test("each status label toggles its own switch", async () => {
    render(
      <ArticleEditor
        articleIn={defaultArticle}
        defaultArticle={defaultArticle}
        setPreview={jest.fn()}
        availableComponents={["H2", "Paragraph"]}
        categories={["Production"]}
      />
    );

    await userEvent.click(screen.getByText("Marked for deletion"));

    expect(screen.getByLabelText("Marked for deletion")).toBeChecked();
    expect(screen.getByLabelText("Published")).not.toBeChecked();
  });

  test("updates the title as the user types", async () => {
    render(
      <ArticleEditor
        articleIn={defaultArticle}
        defaultArticle={defaultArticle}
        setPreview={jest.fn()}
        availableComponents={["H2", "Paragraph"]}
        categories={["Production"]}
      />
    );

    const titleInput = screen.getByPlaceholderText("This is a sample title");
    await userEvent.type(titleInput, "My new article");

    expect(titleInput).toHaveValue("My new article");
  });

  test("adds the currently selected component to the article", async () => {
    render(
      <ArticleEditor
        articleIn={defaultArticle}
        defaultArticle={defaultArticle}
        setPreview={jest.fn()}
        availableComponents={["H2", "Paragraph"]}
        categories={["Production"]}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /Add$/ }));

    expect(
      screen.getByRole("heading", { name: "Click to Update Text" })
    ).toBeInTheDocument();
  });

  test("calls setPreview with the current article and content on Preview", async () => {
    const setPreview = jest.fn();
    render(
      <ArticleEditor
        articleIn={{ ...defaultArticle, title: "Ready article", content: [
          { componenType: "Paragraph", componentId: "p1", data: "Some text" },
        ] }}
        defaultArticle={defaultArticle}
        setPreview={setPreview}
        availableComponents={["H2", "Paragraph"]}
        categories={["Production"]}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /Preview/ }));

    expect(setPreview).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Ready article" })
    );
  });

  test("loads a saved article once it becomes available", () => {
    const savedArticle = { ...defaultArticle, id: "a1", title: "Loaded title" };
    render(
      <ArticleEditor
        articleIn={defaultArticle}
        defaultArticle={defaultArticle}
        setPreview={jest.fn()}
        availableComponents={["H2", "Paragraph"]}
        categories={["Production"]}
        savedArticle={savedArticle}
      />
    );

    expect(screen.getByDisplayValue("Loaded title")).toBeInTheDocument();
  });
});
