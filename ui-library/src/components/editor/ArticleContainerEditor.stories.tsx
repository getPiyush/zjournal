import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import ArticleContainerEditor from "./ArticleContainerEditor";

const meta = {
  title: "Library/Editor/ArticleContainerEditor",
  component: ArticleContainerEditor,
  args: { componentClicked: fn() },
} satisfies Meta<typeof ArticleContainerEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

const content = [
  { componenType: "H1", componentId: "h1-1", data: "Editable heading" },
  { componenType: "Paragraph", componentId: "p-1", data: "Editable paragraph" },
];

export const Default: Story = {
  args: { containerJson: content },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { name: "Editable heading" });
    expect(heading.closest('[id="h1-1"]')).not.toBeNull();

    await userEvent.click(heading);
    expect(args.componentClicked).toHaveBeenCalledTimes(1);
  },
};
