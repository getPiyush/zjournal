import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import ArticlesToolbar from "./ArticlesToolbar";
import { emptyArticleFilters } from "./articleFilters";

const meta = {
  title: "Library/Article/ArticlesToolbar",
  component: ArticlesToolbar,
} satisfies Meta<typeof ArticlesToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { filters: emptyArticleFilters, sortBy: "newest", onFiltersChange: () => {}, onSortChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("searchbox", { name: "Search articles" })).toBeInTheDocument();
    expect(canvas.getByRole("combobox", { name: "Sort articles" })).toHaveValue("newest");
  },
};

export const WithSearchTerm: Story = {
  args: {
    filters: { ...emptyArticleFilters, search: "release", from: "2026-01-01" },
    sortBy: "title-asc",
    shownCount: 3,
    totalCount: 12,
    onFiltersChange: () => {},
    onSortChange: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("searchbox", { name: "Search articles" })).toHaveValue("release");
    expect(canvas.getByRole("combobox", { name: "Sort articles" })).toHaveValue("title-asc");
    expect(canvas.getByLabelText("From")).toHaveValue("2026-01-01");
    expect(canvas.getByRole("status")).toHaveTextContent("Showing 3 of 12 articles");
  },
};

export const AdminWithStatus: Story = {
  args: {
    filters: { ...emptyArticleFilters, status: "draft" },
    sortBy: "newest",
    showStatusFilter: true,
    onFiltersChange: () => {},
    onSortChange: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByLabelText("Status")).toHaveValue("draft");
  },
};

export const Interactive: Story = {
  args: { filters: emptyArticleFilters, sortBy: "newest", onFiltersChange: () => {}, onSortChange: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search articles" }), "space");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Sort articles" }), "oldest");
  },
};
