import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import ArticleContainer from "./ArticleContainer";

const meta = {
  title: "Library/Article/ArticleContainer",
  component: ArticleContainer,
} satisfies Meta<typeof ArticleContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

const content = [
  {
    componenType: "H1",
    componentId: "h1-1",
    data: "A polished article layout",
  },
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

export const Default: Story = {
  args: { containerJson: content },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("heading", { name: "A polished article layout" })
    ).toBeInTheDocument();
    expect(canvas.getAllByRole("listitem")).toHaveLength(3);
  },
};
