import { render, screen } from "@testing-library/react";

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
});
