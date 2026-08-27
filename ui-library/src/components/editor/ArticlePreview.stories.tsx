import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import ArticlePreview from "./ArticlePreview";

const meta = {
  title: "Library/Editor/ArticlePreview",
  component: ArticlePreview,
  args: { onEdit: fn() },
} satisfies Meta<typeof ArticlePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleArticle = {
  id: "preview-001",
  author: "Nadia",
  title: "A practical editor workflow",
  createdAt: new Date("2024-06-01T08:00:00Z"),
  updatedAt: new Date("2024-06-03T09:30:00Z"),
  categryId: "Editorial",
  origin: "server" as const,
  published: true,
  deleteFlag: false,
  content: [
    {
      componenType: "Image",
      componentId: "img-preview",
      data: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
      altText: "Editor workspace",
    },
  ],
};

export const Default: Story = {
  args: { data: sampleArticle },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Published")).toBeInTheDocument();
    expect(canvas.getByText(/id : preview-001/)).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("link", { name: "Edit" }));
    expect(args.onEdit).toHaveBeenCalledWith(sampleArticle);
  },
};

export const Unpublished: Story = {
  args: { data: { ...sampleArticle, published: false, deleteFlag: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Not Published")).toBeInTheDocument();
    expect(canvas.getByText("Deleted")).toBeInTheDocument();
  },
};
