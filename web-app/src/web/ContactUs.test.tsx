import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../datastore/actions/ContactActions", () => ({
  addContactToDB: jest.fn(),
}));

import ContactUs from "./ContactUs";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { addContactToDB } from "../datastore/actions/ContactActions";

describe("ContactUs", () => {
  test("submits the form with the entered contact details", async () => {
    renderWithProviders(<ContactUs />, { route: "/web/contactus" });

    await userEvent.type(screen.getByLabelText("Full Name"), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText("Email address"), "ada@example.com");
    // The phone input has no id/htmlFor linking it to its <label>.
    await userEvent.type(
      screen.getByPlaceholderText("Enter phone number"),
      "1234567890"
    );
    await userEvent.type(screen.getByLabelText("Comments"), "Great blog!");

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

  test("sets the document title", () => {
    renderWithProviders(<ContactUs />, { route: "/web/contactus" });
    expect(document.title).toContain("Contact Us");
  });
});
