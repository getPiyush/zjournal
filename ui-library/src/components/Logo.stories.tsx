import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Logo } from "./Logo";

const meta = {
  title: "Library/Logo",
  component: Logo,
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Article Collections")).toBeInTheDocument();
    expect(canvas.getByText("by Piyush Praharaj")).toBeInTheDocument();
  },
};
