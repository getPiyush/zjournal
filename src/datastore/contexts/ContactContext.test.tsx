import { act, renderHook } from "@testing-library/react";

import { ContactProvider, useContact } from "./ContactContext";

function setup() {
  return renderHook(() => useContact(), {
    wrapper: ({ children }) => <ContactProvider>{children}</ContactProvider>,
  });
}

describe("useContact", () => {
  test("throws when used outside of a ContactProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useContact())).toThrow(
      "useContact must be used within a ContactProvider"
    );
    consoleError.mockRestore();
  });

  test("starts with the default contact and an empty status", () => {
    const { result } = setup();
    expect(result.current.state.status).toBe("");
    expect(result.current.state.contacts).toHaveLength(1);
  });

  test.each([
    ["get_contacts_loading", "get_contacts_loading"],
    ["get_contacts_error", "get_contacts_error"],
    ["add_contact_loading", "add_contact_loading"],
    ["add_contact_error", "add_contact_error"],
  ])("%s sets status to %s while preserving the contact list", (type, status) => {
    const { result } = setup();
    const contactsBefore = result.current.state.contacts;

    act(() => {
      result.current.dispatch({ type } as any);
    });

    expect(result.current.state.status).toBe(status);
    expect(result.current.state.contacts).toBe(contactsBefore);
  });

  test("get_contacts_success replaces the contact list", () => {
    const { result } = setup();
    const contacts: any = [{ name: "Ada" }, { name: "Grace" }];

    act(() => {
      result.current.dispatch({ type: "get_contacts_success", value: contacts });
    });

    expect(result.current.state).toEqual({
      status: "get_contacts_success",
      contacts,
    });
  });

  test("add_contact_success replaces the contact list with the new contact", () => {
    const { result } = setup();
    const contact: any = { name: "Ada" };

    act(() => {
      result.current.dispatch({ type: "add_contact_success", value: contact });
    });

    expect(result.current.state).toEqual({
      status: "add_contact_success",
      contacts: [contact],
    });
  });

  test("an unhandled action type throws", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = setup();

    expect(() => {
      act(() => {
        result.current.dispatch({ type: "not_a_real_action" } as any);
      });
    }).toThrow();

    consoleError.mockRestore();
  });
});
