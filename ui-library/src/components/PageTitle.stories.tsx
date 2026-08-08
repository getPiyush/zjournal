import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { PageTitle } from "./PageTitle";

const meta = {
  title: "Library/PageTitle",
  component: PageTitle,
} satisfies Meta<typeof PageTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: "Admin: Articles" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.getByRole("heading", { name: "Admin: Articles" })
    ).toBeInTheDocument();
  },
};
