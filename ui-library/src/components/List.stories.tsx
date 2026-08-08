import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { List } from "./List";

const meta = {
  title: "Library/List",
  component: List,
} satisfies Meta<typeof List>;

export default meta;

type Story = StoryObj<typeof meta>;

const listData = {
  componenType: "List",
  componentId: "list1",
  data: ["Plan the launch", "Write the release notes", "Share with the team"],
  numbered: false,
};

export const Default: Story = {
  args: { listData },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvasElement.querySelector("ul")).not.toBeNull();
    expect(canvasElement.querySelector("ol")).toBeNull();
    expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    expect(canvas.getByText("Plan the launch")).toBeInTheDocument();
  },
};

export const Numbered: Story = {
  args: { listData: { ...listData, numbered: true } },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector("ol")).not.toBeNull();
    expect(canvasElement.querySelector("ul")).toBeNull();
  },
};
