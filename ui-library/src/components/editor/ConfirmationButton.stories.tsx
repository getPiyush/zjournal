import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, screen, userEvent, within } from "storybook/test";
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

    await userEvent.click(trigger);
    // The dialog is portalled to document.body, outside the canvas.
    const dialog = within(await screen.findByRole("alertdialog"));
    expect(dialog.getByText("Are you sure?")).toBeInTheDocument();

    await userEvent.click(dialog.getByRole("button", { name: "Delete" }));
    expect(args.confirmationClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};

export const Open: Story = {
  args: {
    buttonText: "Logout",
    title: "Log out?",
    confirmationMessage: "Are you sure want to log out?",
    confirmText: "Log out",
    iconComp: <i className="bi bi-x-square-fill" />,
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Logout/ }));
  },
};

export const IconOnly: Story = {
  args: { buttonText: "" },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: /Delete/ })).toBeDisabled();
  },
};
