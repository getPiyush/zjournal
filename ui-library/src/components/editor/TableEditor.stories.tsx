import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, waitFor, within } from "storybook/test";
import { TableEditor } from "./TableEditor";

const meta = {
  title: "Library/Editor/TableEditor",
  component: TableEditor,
  args: { updateTableData: fn() },
} satisfies Meta<typeof TableEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tableData: {
      componenType: "Table",
      componentId: "t1",
      data: "A|B\nC|D",
      numbered: false,
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(args.updateTableData).toHaveBeenCalledWith(
        expect.objectContaining({ data: "A|B\nC|D" })
      )
    );
    expect(canvas.getByRole("textbox")).toHaveValue("A|B\nC|D");
    expect(canvas.getByText("A")).toBeInTheDocument();
  },
};
