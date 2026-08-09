import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import ArticlesToolbar from "./ArticlesToolbar";

const meta = {
  title: "Library/Article/ArticlesToolbar",
  component: ArticlesToolbar,
} satisfies Meta<typeof ArticlesToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { search: "", sortBy: "newest", onSearchChange: () => {}, onSortChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("searchbox", { name: "Search articles" })).toBeInTheDocument();
    expect(canvas.getByRole("combobox", { name: "Sort articles" })).toHaveValue("newest");
  },
};

export const WithSearchTerm: Story = {
  args: { search: "release", sortBy: "title-asc", onSearchChange: () => {}, onSortChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("searchbox", { name: "Search articles" })).toHaveValue("release");
    expect(canvas.getByRole("combobox", { name: "Sort articles" })).toHaveValue("title-asc");
  },
};

export const Interactive: Story = {
  args: { search: "", sortBy: "newest", onSearchChange: () => {}, onSortChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search articles" }), "space");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Sort articles" }), "oldest");
  },
};
