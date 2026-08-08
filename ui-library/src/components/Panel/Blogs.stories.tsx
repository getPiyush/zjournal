import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import Blogs from "./Blogs";

const meta = {
  title: "Library/Panel/Blogs",
  component: Blogs,
} satisfies Meta<typeof Blogs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { startDate: "2024-01-01" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { name: "Blogs" })).toBeInTheDocument();
    expect(canvas.getByText("Archives")).toBeInTheDocument();
    expect(canvas.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/getPiyush"
    );
  },
};
