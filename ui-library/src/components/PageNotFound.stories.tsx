import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { PageNotFound } from "./PageNotFound";

const meta = {
  title: "Library/PageNotFound",
  component: PageNotFound,
  args: { onBrowseCategories: fn() },
} satisfies Meta<typeof PageNotFound>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("heading", { name: /404/i })
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("link", { name: "Go Home" }));

    await userEvent.click(
      canvas.getByRole("button", { name: "Browse Categories" })
    );
    expect(args.onBrowseCategories).toHaveBeenCalledTimes(1);
  },
};
