import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, within } from "storybook/test";
import { TemplateRenderer } from "./TemplateRenderer";

const meta = {
  title: "Library/Templates/TemplateRenderer",
  component: TemplateRenderer,
  args: { invalidArticleError: fn() },
} satisfies Meta<typeof TemplateRenderer>;

export default meta;

type Story = StoryObj<typeof meta>;

const articles = [
  {
    id: "article-001",
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
  },
];

export const HeroLayout: Story = {
  args: {
    dataString: "article-001",
    mode: "view",
    articles,
    status: "success",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Shipping with confidence")).toBeInTheDocument();
  },
};

export const InvalidArticle: Story = {
  args: {
    dataString: "missing-id",
    mode: "edit",
    articles,
    status: "success",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Invalid Article")).toBeInTheDocument();
    expect(args.invalidArticleError).toHaveBeenCalledWith("missing-id", true);
  },
};
