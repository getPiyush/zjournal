import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
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
    expect(canvas.queryByText(/^by /)).toBeNull();
  },
};

export const CustomText: Story = {
  args: { title: "My Journal", subtext: "by Ada Lovelace" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("My Journal")).toBeInTheDocument();
    expect(canvas.getByText("by Ada Lovelace")).toBeInTheDocument();
  },
};

export const WithImage: Story = {
  args: {
    title: "My Journal",
    subtext: "by Ada Lovelace",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=200&q=80",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("img", { name: "My Journal" })).toBeInTheDocument();
    expect(canvas.queryByText("My Journal")).toBeNull();
    expect(canvas.getByText("by Ada Lovelace")).toBeInTheDocument();
  },
};

export const Clickable: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const logo = canvas.getByRole("button");

    await userEvent.click(logo);

    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
