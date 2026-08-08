import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import ArticlePreviewWeb from "./ArticlePreviewWeb";

const meta = {
  title: "Library/Article/ArticlePreviewWeb",
  component: ArticlePreviewWeb,
} satisfies Meta<typeof ArticlePreviewWeb>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleArticle = {
  id: "article-001",
  author: "Piyush",
  title: "Designing a better release workflow",
  dateCreated: new Date("2024-05-10T10:30:00Z"),
  dateModified: new Date("2024-05-12T08:15:00Z"),
  categryId: "Engineering",
  origin: "server" as const,
  published: true,
  deleteFlag: false,
  content: [
    {
      componenType: "Image",
      componentId: "img1",
      data: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80",
      altText: "Team planning on a whiteboard",
    },
    {
      componenType: "Paragraph",
      componentId: "p1",
      data: "A well-defined release workflow helps teams avoid bottlenecks and keep shipping with confidence.",
    },
  ],
};

export const Default: Story = {
  args: { data: sampleArticle },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("link", { name: "Designing a better release workflow" })
    ).toHaveAttribute("href", "article/article-001");
    expect(canvas.getByRole("img")).toBeInTheDocument();
    expect(canvas.getByRole("link", { name: "read more" })).toBeInTheDocument();
  },
};
