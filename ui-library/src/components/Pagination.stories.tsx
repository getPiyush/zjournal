import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Pagination } from "./Pagination";

const meta = {
  title: "Library/Pagination",
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FewPages: Story = {
  args: { page: 1, pageCount: 3, onPageChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(canvas.getByRole("button", { name: "Previous" })).toBeDisabled();
  },
};

export const ManyPages: Story = {
  args: { page: 6, pageCount: 12, onPageChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: "Page 6" })).toHaveAttribute("aria-current", "page");
    expect(canvas.getByRole("button", { name: "Page 12" })).toBeInTheDocument();
  },
};
