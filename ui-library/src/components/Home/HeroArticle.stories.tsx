import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import HeroArticle from "./HeroArticle";

const meta = {
  title: "Library/Home/HeroArticle",
  component: HeroArticle,
} satisfies Meta<typeof HeroArticle>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleArticle = {
  id: "article-hero-1",
  author: "Mina",
  title: "Shipping with confidence",
  dateCreated: new Date("2024-04-20T09:00:00Z"),
  dateModified: new Date("2024-04-21T12:30:00Z"),
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

export const Default: Story = {
  args: { article: sampleArticle },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("heading", { name: "Shipping with confidence" })
    ).toBeInTheDocument();
    expect(canvas.getByText("Mina", { exact: false })).toBeInTheDocument();
  },
};
