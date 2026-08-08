import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ConfirmationButton from "./ConfirmationButton";

describe("ConfirmationButton", () => {
  test("renders the trigger text and confirmation message", () => {
    render(
      <ConfirmationButton
        buttonText="Delete"
        confirmationMessage="Are you sure?"
        confirmationClick={jest.fn()}
        iconComp={<i />}
        disabled={false}
      />
    );

    expect(screen.getByRole("button", { name: /Delete/ })).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  test("calls confirmationClick when Yes is clicked", async () => {
    const confirmationClick = jest.fn();
    render(
      <ConfirmationButton
        buttonText="Delete"
        confirmationMessage="Are you sure?"
        confirmationClick={confirmationClick}
        iconComp={<i />}
        disabled={false}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(confirmationClick).toHaveBeenCalledTimes(1);
  });

  test("disables the trigger button when disabled", () => {
    render(
      <ConfirmationButton
        buttonText="Delete"
        confirmationMessage="Are you sure?"
        confirmationClick={jest.fn()}
        iconComp={<i />}
        disabled
      />
    );

    expect(screen.getByRole("button", { name: /Delete/ })).toBeDisabled();
  });
});
