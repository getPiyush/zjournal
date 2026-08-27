import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import Article from "./Article";

const meta = {
  title: "Library/Article/Article",
  component: Article,
} satisfies Meta<typeof Article>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleArticle = {
  id: "article-002",
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
    {
      componenType: "List",
      componentId: "list1",
      data: ["Validate the deployment", "Watch the metrics", "Share the update"],
      numbered: true,
    },
  ],
};

export const Default: Story = {
  args: { article: sampleArticle, status: "success" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("heading", { name: "Shipping with confidence" })
    ).toBeInTheDocument();
    expect(canvas.getByText("Mina", { exact: false })).toBeInTheDocument();
    expect(canvas.getByText("Product")).toBeInTheDocument();
    expect(canvas.getByRole("link", { name: "Mina" })).toHaveAttribute(
      "href",
      "/web/articles?authorId=Mina"
    );
  },
};

export const NotFound: Story = {
  args: { article: null, status: "error" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  },
};
