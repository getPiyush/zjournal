import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import Articles from "./Articles";

const meta = {
  title: "Library/Article/Articles",
  component: Articles,
} satisfies Meta<typeof Articles>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleArticles = [
  {
    id: "article-001",
    author: "Mina",
    title: "Shipping with confidence",
    dateCreated: new Date("2024-04-20T09:00:00Z"),
    dateModified: new Date("2024-04-21T12:30:00Z"),
    categryId: "Product",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [
      {
        componenType: "Paragraph",
        componentId: "p1",
        data: "A simple plan, clear ownership, and a calm rollout made this release feel effortless.",
      },
    ],
  },
  {
    id: "article-002",
    author: "Jules",
    title: "Designing for the edges",
    dateCreated: new Date("2024-05-02T09:00:00Z"),
    dateModified: new Date("2024-05-02T09:00:00Z"),
    categryId: "Design",
    origin: "server" as const,
    published: true,
    deleteFlag: false,
    content: [],
  },
];

export const Default: Story = {
  args: { title: "Product", status: "success", articles: sampleArticles },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { name: /Product Articles/ })).toBeInTheDocument();
    expect(canvas.getByText("Shipping with confidence")).toBeInTheDocument();
    expect(canvas.getByText("Designing for the edges")).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { title: "Product", status: "loading", articles: [] },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector(".blob-1")).not.toBeNull();
  },
};

export const Empty: Story = {
  args: { title: "Product", status: "success", articles: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  },
};

export const SearchNarrowsResults: Story = {
  args: { title: "Product", status: "success", articles: sampleArticles },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search articles" }), "edges");

    expect(canvas.getByText("Designing for the edges")).toBeInTheDocument();
    expect(canvas.queryByText("Shipping with confidence")).toBeNull();
  },
};
