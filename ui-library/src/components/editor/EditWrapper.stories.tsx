import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import EditWrapper from "./EditWrapper";

const meta = {
  title: "Library/Editor/EditWrapper",
  component: EditWrapper,
  args: {
    id: "comp-1",
    componentClicked: fn(),
    children: <p>EditWrapper preview</p>,
  },
} satisfies Meta<typeof EditWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByRole("button");

    expect(wrapper.id).toBe("comp-1");
    expect(canvas.getByText("EditWrapper preview")).toBeInTheDocument();

    await userEvent.click(wrapper);
    expect(args.componentClicked).toHaveBeenCalledTimes(1);
  },
};
