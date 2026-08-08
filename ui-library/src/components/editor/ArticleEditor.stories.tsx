import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import ArticleEditor from "./ArticleEditor";

const defaultArticle = {
  id: "",
  author: "Piyush",
  title: "",
  dateCreated: new Date("2024-06-01T08:00:00Z"),
  dateModified: new Date("2024-06-01T08:00:00Z"),
  categryId: "Production",
  origin: "local" as const,
  published: false,
  deleteFlag: false,
  content: [],
};

const meta = {
  title: "Library/Editor/ArticleEditor",
  component: ArticleEditor,
  args: {
    articleIn: defaultArticle,
    defaultArticle,
    setPreview: fn(),
    availableComponents: ["H2", "Paragraph", "Image"],
    categories: ["Production", "Design"],
  },
} satisfies Meta<typeof ArticleEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewArticle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText("Creating New", { exact: false })).toBeInTheDocument();

    const titleInput = canvas.getByPlaceholderText(
      "This is a sample title"
    ) as HTMLInputElement;
    await userEvent.type(titleInput, "My new article");
    expect(titleInput).toHaveValue("My new article");

    await userEvent.click(canvas.getByRole("button", { name: /Add$/ }));
    expect(
      canvas.getByRole("heading", { name: "Click to Update Text" })
    ).toBeInTheDocument();
  },
};
