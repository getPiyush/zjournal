import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ListEditor } from "./ListEditor";

const meta = {
  title: "Library/Editor/ListEditor",
  component: ListEditor,
  args: { updateListData: fn() },
} satisfies Meta<typeof ListEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    listData: { componenType: "List", componentId: "l1", data: ["A", "B"], numbered: false },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Mounting calls updateListData once via a post-commit effect.
    await waitFor(() =>
      expect(args.updateListData).toHaveBeenCalledWith(
        expect.objectContaining({ data: ["A", "B"] })
      )
    );

    const addButton = canvasElement.querySelector("#addButton") as HTMLElement;
    await userEvent.click(addButton);
    expect(canvas.getAllByRole("textbox")).toHaveLength(3);
  },
};
