import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { ArticleScroller } from "./ArticleScroller";

const meta = {
  title: "Library/ArticleScroller",
  component: ArticleScroller,
} satisfies Meta<typeof ArticleScroller>;

export default meta;

type Story = StoryObj<typeof meta>;

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

export const Default: Story = {
  args: { articles: sampleArticles },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByText("Shipping with confidence")).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Show More" }));

    expect(canvas.getByText("Shipping with confidence")).toBeInTheDocument();
  },
};
