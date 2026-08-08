import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import EditPrompt from "./EditPrompt";

const meta = {
  title: "Library/Editor/EditPrompt",
  component: EditPrompt,
  args: {
    onCancel: fn(),
    onUpdate: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof EditPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleComponent = {
  componenType: "Paragraph",
  componentId: "edit-text",
  data: "Edit this paragraph to see how the prompt behaves.",
};

export const Default: Story = {
  args: { component: sampleComponent },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.getByRole("heading", { name: "Editing Paragraph" })
    ).toBeInTheDocument();
    expect(canvas.getByDisplayValue(sampleComponent.data)).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Update" }));
    expect(args.onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: sampleComponent.data })
    );

    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};
