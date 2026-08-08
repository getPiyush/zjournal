import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Table } from "./Table";

const meta = {
  title: "Library/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

const tableData = {
  componenType: "Table",
  componentId: "table1",
  data: "Name|Role|Status\nAva|Engineering Lead|Active\nLeo|Product Designer|Review",
  numbered: false,
};

export const Default: Story = {
  args: { tableData },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvasElement.querySelector("thead")).toBeNull();
    expect(canvas.getByText("Ava")).toBeInTheDocument();
    expect(canvas.getAllByRole("row")).toHaveLength(3);
  },
};

export const WithHeader: Story = {
  args: { tableData: { ...tableData, numbered: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvasElement.querySelector("thead")).not.toBeNull();
    expect(canvas.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
  },
};
