import { act, render, screen } from "@testing-library/react";

jest.mock("../../datastore/actions/ContactActions", () => ({
  getContactsDB: jest.fn(),
}));

import { Contacts } from "./Contacts";
import { AllProviders } from "../../testUtils/renderWithProviders";
import { getContactsDB } from "../../datastore/actions/ContactActions";

describe("admin Contacts", () => {
  test("fetches contacts on mount and shows the total count", () => {
    render(
      <AllProviders>
        <Contacts />
      </AllProviders>
    );

    expect(getContactsDB).toHaveBeenCalledWith(expect.any(Function));
    expect(screen.getByRole("heading", { name: /1 Total/ })).toBeInTheDocument();
  });

  test("shows a visitor's comment as plain text, never as HTML", () => {
    const comment = '<img src="x" onerror="alert(1)"><b>hi</b>\nsecond line';
    (getContactsDB as jest.Mock).mockImplementation((dispatch) =>
      dispatch({
        type: "get_contacts_success",
        value: [{ name: "Eve", email: "eve@example.com", phone: "123", comment, createdAt: new Date() }],
      })
    );

    act(() => {
      render(
        <AllProviders>
          <Contacts />
        </AllProviders>
      );
    });

    const commentBox = screen.getByText(/second line/);
    expect(commentBox.textContent).toBe(comment);
    expect(commentBox).toHaveStyle({ whiteSpace: "pre-wrap" });
    expect(commentBox.querySelector("img, b")).toBeNull();

    // Collapsed panels say so, and each panel is labelled by its own header.
    const toggle = screen.getByRole("button", { name: /Eve/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(document.getElementById(panel.getAttribute("aria-labelledby")!)).toContainElement(toggle);
    expect(panel).not.toHaveAttribute("data-bs-parent");
    expect(document.querySelector("img")).toBeNull();
  });
});
