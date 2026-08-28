import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import SaveButton from "./SaveButton";

const meta = {
  title: "Library/Editor/SaveButton",
  component: SaveButton,
  args: { onSave: fn() },
} satisfies Meta<typeof SaveButton>;

export default meta;

type Story = StoryObj<typeof meta>;

const baseArticle = {
  id: "",
  author: "Piyush",
  title: "Draft article",
  createdAt: new Date("2024-06-01T08:00:00Z"),
  updatedAt: new Date("2024-06-01T08:00:00Z"),
  categryId: "Production",
  origin: "local" as const,
  published: false,
  deleteFlag: false,
  content: [
    { componenType: "Paragraph", componentId: "p1", data: "Some content" },
  ],
};

export const NewArticle: Story = {
  args: { article: baseArticle },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: /Add Article/ })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button"));
    expect(args.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ origin: "server" }),
      true
    );
  },
};

export const ExistingArticle: Story = {
  args: { article: { ...baseArticle, id: "article-1", origin: "server" as const } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: /Update Article/ })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button"));
    expect(args.onSave).toHaveBeenCalledWith(expect.anything(), false);
  },
};

export const DisabledWithoutTitle: Story = {
  args: { article: { ...baseArticle, title: "" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button")).toBeDisabled();
  },
};
