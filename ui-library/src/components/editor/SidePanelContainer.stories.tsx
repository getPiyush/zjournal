import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import SidePanelContainer from "./SidePanelContainer";

const meta = {
  title: "Library/Editor/SidePanelContainer",
  component: SidePanelContainer,
} satisfies Meta<typeof SidePanelContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { pageContent: <div>Editor Panel</div> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Editor Panel")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { pageContent: null },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector("#offcanvasRight")?.textContent).toBe("");
  },
};
