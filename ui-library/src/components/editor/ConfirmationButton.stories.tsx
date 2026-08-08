import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import ConfirmationButton from "./ConfirmationButton";

const meta = {
  title: "Library/Editor/ConfirmationButton",
  component: ConfirmationButton,
  args: {
    buttonText: "Delete",
    confirmationMessage: "Are you sure?",
    confirmationClick: fn(),
    iconComp: <i className="bi bi-trash" />,
    disabled: false,
  },
} satisfies Meta<typeof ConfirmationButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Delete/ });

    expect(canvas.getByText("Are you sure?")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Yes" }));
    expect(args.confirmationClick).toHaveBeenCalledTimes(1);
    expect(trigger).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: /Delete/ })).toBeDisabled();
  },
};
