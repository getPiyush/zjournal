import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import LoadingPage from "./LoadingPage";

const meta = {
  title: "Library/Loader/LoadingPage",
  component: LoadingPage,
} satisfies Meta<typeof LoadingPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('[data-testid="loading-page"]')).not.toBeNull();
  },
};
