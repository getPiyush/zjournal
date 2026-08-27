import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import ArticleCard from "./ArticleCard";

const meta = {
  title: "Library/Home/ArticleCard",
  component: ArticleCard,
} satisfies Meta<typeof ArticleCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleArticle = {
  id: "article-card-1",
  author: "Mina",
  title: "Shipping with confidence",
  createdAt: new Date("2024-04-20T09:00:00Z"),
  updatedAt: new Date("2024-04-21T12:30:00Z"),
  categryId: "Product",
  origin: "server" as const,
  published: true,
  deleteFlag: false,
  content: [
    {
      componenType: "Paragraph",
      componentId: "p1",
      data: "A simple plan, clear ownership, and a calm rollout made this release feel effortless.",
    },
  ],
};

export const View: Story = {
  args: { article: sampleArticle, mode: "view" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Shipping with confidence")).toBeInTheDocument();
    expect(canvas.getByRole("link", { name: "more.." })).toHaveAttribute(
      "href",
      "article/article-card-1"
    );
  },
};

export const Edit: Story = {
  args: { article: sampleArticle, mode: "edit" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("link", { name: "more.." })).toHaveAttribute(
      "href",
      "/web/article/article-card-1"
    );
    expect(canvas.getByText("article-card-1")).toBeInTheDocument();
  },
};
