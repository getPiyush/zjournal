import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConfirmationButton from "./ConfirmationButton";

const renderButton = (props: Partial<React.ComponentProps<typeof ConfirmationButton>> = {}) =>
  render(
    <ConfirmationButton
      buttonText="Delete"
      confirmationMessage="Are you sure?"
      confirmationClick={jest.fn()}
      iconComp={<i />}
      disabled={false}
      {...props}
    />
  );

describe("ConfirmationButton", () => {
  test("renders the trigger and keeps the dialog closed initially", () => {
    renderButton();

    expect(screen.getByRole("button", { name: /Delete/ })).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("opens the dialog with the message and focuses cancel", async () => {
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: /Delete/ }));

    expect(screen.getByRole("alertdialog")).toHaveAccessibleDescription("Are you sure?");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  test("calls confirmationClick and closes when confirmed", async () => {
    const confirmationClick = jest.fn();
    renderButton({ confirmationClick });

    await userEvent.click(screen.getByRole("button", { name: /Delete/ }));
    const dialog = screen.getByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(confirmationClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test.each([
    ["the cancel button", async () => userEvent.click(screen.getByRole("button", { name: "Cancel" }))],
    ["Escape", async () => userEvent.keyboard("{Escape}")],
  ])("closes without confirming via %s", async (_, dismiss) => {
    const confirmationClick = jest.fn();
    renderButton({ confirmationClick });

    await userEvent.click(screen.getByRole("button", { name: /Delete/ }));
    await dismiss();

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(confirmationClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Delete/ })).toHaveFocus();
  });

  test("uses custom labels", async () => {
    renderButton({ title: "Log out", confirmText: "Yes, log out", cancelText: "Stay" });

    await userEvent.click(screen.getByRole("button", { name: /Delete/ }));

    expect(screen.getByRole("alertdialog")).toHaveAccessibleName("Log out");
    expect(screen.getByRole("button", { name: "Yes, log out" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stay" })).toBeInTheDocument();
  });

  test("disables the trigger button when disabled", () => {
    renderButton({ disabled: true });

    expect(screen.getByRole("button", { name: /Delete/ })).toBeDisabled();
  });
});
