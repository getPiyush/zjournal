import { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../datastore/actions/ContactActions", () => ({
  addContactToDB: jest.fn(),
}));

import ContactUs from "./ContactUs";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { addContactToDB } from "../datastore/actions/ContactActions";

// Stands in for the real action: moves the shared contact state through loading to `outcome`.
const respondWith = (outcome: "add_contact_success" | "add_contact_error" | null) => {
  (addContactToDB as jest.Mock).mockImplementation((dispatch, contact) => {
    dispatch({ type: "add_contact_loading" });
    if (outcome) dispatch({ type: outcome, value: contact });
  });
};

const fillRequired = async () => {
  await userEvent.type(screen.getByLabelText("Full Name"), "Ada Lovelace");
  await userEvent.type(screen.getByLabelText("Email address"), "ada@example.com");
  await userEvent.type(screen.getByLabelText("Comments"), "Great blog!");
};

describe("ContactUs", () => {
  beforeEach(() => (addContactToDB as jest.Mock).mockReset());

  test("submits the form with the entered contact details", async () => {
    renderWithProviders(<ContactUs />, { route: "/web/contactus" });

    await fillRequired();
    await userEvent.type(screen.getByLabelText(/Phone Number/), "1234567890");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(addContactToDB).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "1234567890",
        comment: "Great blog!",
      })
    );
  });

  test("phone is optional and left out when empty", async () => {
    renderWithProviders(<ContactUs />, { route: "/web/contactus" });

    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    const sent = (addContactToDB as jest.Mock).mock.calls[0][1];
    expect(sent).not.toHaveProperty("phone");
  });

  test("disables the button while sending, so the message isn't sent twice", async () => {
    respondWith(null);
    renderWithProviders(<ContactUs />, { route: "/web/contactus" });

    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
  });

  test("shows an error and keeps the form when sending fails", async () => {
    respondWith("add_contact_error");
    renderWithProviders(<ContactUs />, { route: "/web/contactus" });

    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByRole("alert")).toHaveTextContent("couldn't be sent");
    expect(screen.getByLabelText("Full Name")).toHaveValue("Ada Lovelace");
  });

  test("thanks the visitor, then lets them send another message", async () => {
    respondWith("add_contact_success");
    renderWithProviders(<ContactUs />, { route: "/web/contactus" });

    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Thank you !")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Send another message" }));
    expect(screen.getByLabelText("Full Name")).toHaveValue("");
  });

  test("a later visit starts with the form, not the previous thank-you", async () => {
    respondWith("add_contact_success");
    // Unmounts and remounts the page while the shared contact state still says "success".
    function Revisit() {
      const [shown, setShown] = useState(true);
      return (
        <>
          <button onClick={() => setShown(!shown)}>toggle page</button>
          {shown && <ContactUs />}
        </>
      );
    }
    renderWithProviders(<Revisit />, { route: "/web/contactus" });

    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Thank you !")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "toggle page" }));
    await userEvent.click(screen.getByRole("button", { name: "toggle page" }));
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
  });

  test("sets the document title", () => {
    renderWithProviders(<ContactUs />, { route: "/web/contactus" });
    expect(document.title).toContain("Contact Us");
  });
});
