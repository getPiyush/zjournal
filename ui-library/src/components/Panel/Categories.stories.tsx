import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import Categories from "./Categories";

const meta = {
  title: "Library/Panel/Categories",
  component: Categories,
} satisfies Meta<typeof Categories>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { categories: ["Product", "Design", "Engineering"] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
    expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    expect(canvas.getByRole("link", { name: "Product" })).toHaveAttribute(
      "href",
      "/web/articles?categoryId=Product"
    );
  },
};

export const Empty: Story = {
  args: { categories: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryAllByRole("listitem")).toHaveLength(0);
  },
};
