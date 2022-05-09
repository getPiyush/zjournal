import { Contact } from "../../Types";

import { decryptData } from "../../utils/crypto";
import { addContactAPI, getContactsAPI } from "../api";

export const getContactsDB = (dispatch) => {
  dispatch({ type: "get_contacts_loading" });
  getContactsAPI()
    .then(function (response) {
      dispatch({ type: "get_contacts_success", value:  decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
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
      dispatch({ type: "add_contact_success", value: decryptData(response.data) });
    })
    .catch(function (error) {
      // console.log(error);
      dispatch({ type: "add_contact_error" });
    })
    .then(function () {
      // always executed
    });
};
