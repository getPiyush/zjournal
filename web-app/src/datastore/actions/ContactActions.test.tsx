jest.mock("../api");
jest.mock("../codec");

import { getContactsDB, addContactToDB } from "./ContactActions";
import { addContactAPI, getContactsAPI } from "../api";
import { decryptData } from "../codec";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  jest.clearAllMocks();
  (decryptData as jest.Mock).mockImplementation((data) => data);
});

describe("getContactsDB", () => {
  test("dispatches loading then success with decrypted contacts", async () => {
    const dispatch = jest.fn();
    (getContactsAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue([{ name: "Ada" }]);

    getContactsDB(dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: "get_contacts_loading" });
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: "get_contacts_success",
      value: [{ name: "Ada" }],
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getContactsAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    getContactsDB(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_contacts_error" });
  });
});

describe("addContactToDB", () => {
  const contact: any = { name: "Ada", email: "ada@example.com" };

  test("dispatches loading then success with the decrypted contact", async () => {
    const dispatch = jest.fn();
    (addContactAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue(contact);

    addContactToDB(dispatch, contact);

    expect(dispatch).toHaveBeenCalledWith({ type: "add_contact_loading" });
    await flushPromises();

    expect(addContactAPI).toHaveBeenCalledWith(contact);
    expect(dispatch).toHaveBeenCalledWith({
      type: "add_contact_success",
      value: contact,
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (addContactAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    addContactToDB(dispatch, contact);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "add_contact_error" });
  });
});
