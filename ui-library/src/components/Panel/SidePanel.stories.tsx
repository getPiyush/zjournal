import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import SidePanel from "./SidePanel";

const meta = {
  title: "Library/Panel/SidePanel",
  component: SidePanel,
} satisfies Meta<typeof SidePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Categories: Story = {
  args: {
    selectedPage: "categories",
    categories: ["Product", "Design", "Engineering"],
    startDate: "2024-01-01",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
  },
};

export const Blogs: Story = {
  args: {
    selectedPage: "blogs",
    categories: [],
    startDate: "2024-01-01",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { name: "Blogs" })).toBeInTheDocument();
  },
};

export const NoSelection: Story = {
  args: {
    categories: ["Product"],
    startDate: "2024-01-01",
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector(".offcanvas-body")).toBeNull();
  },
};
