import { Contact } from "@zjournal/ui-library";
import { readResponse } from "../responses";
import { notifyError } from "../notifications";
import { addContactAPI, getContactsAPI } from "../api";

export const getContactsDB = (dispatch) => {
  dispatch({ type: "get_contacts_loading" });
  getContactsAPI()
    .then(function (response) {
      dispatch({ type: "get_contacts_success", value: readResponse(response) });
    })
    .catch(function (error) {
      notifyError("Couldn't load contacts", error);
      dispatch({ type: "get_contacts_error" });
    })
    .then(function () {
      // always executed
    });
};

export const addContactToDB = (dispatch, contact: Contact) => {
  dispatch({ type: "add_contact_loading" });
  addContactAPI(contact)
    .then(function (response) {
      dispatch({ type: "add_contact_success", value: readResponse(response) });
    })
    .catch(function (error) {
      dispatch({ type: "add_contact_error" });
    })
    .then(function () {
      // always executed
    });
};
