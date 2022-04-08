import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { applicationProperties } from "../ApplicationConstants";
import { useContact } from "../datastore/contexts/ContactContext";
import { addContactToDB } from "../datastore/actions/ContactActions";
import { Contact } from "../Types";
import { Logo } from "./components/Logo";

export default function ContactUs() {
  window.document.title = `Contact Us - ${applicationProperties.title}`;
  const [value, setValue] = useState();
  const { dispatch, state: contactState } = useContact();

  const params = useLocation().search;
  // const articleId = path.split("/")[3];
  const submitableContact =
    params.search("contact_name") !== -1 &&
    params.search("contact_email") !== -1 &&
    params.search("contact_comment") !== -1;

  const phoneNoChaged = (phoneNo) => {
    setValue(phoneNo);
  };

  const addContact = () => {
    if (submitableContact) {
      const paramObj = `{"${params
        .replace("?", "")
        .replace(/contact_/g, "")
        .split("&")
        .map((param) => param.split("=").join('":"'))
        .join('","')}"}`;
      console.log(paramObj);

      const unescapedParams = JSON.parse(paramObj);
      console.log(unescapedParams);

      let outContact: Contact = {
        ...unescapedParams,
        dateContacted: new Date(),
      };
      console.log(outContact, decodeURIComponent(paramObj));
      if (contactState.status !== "loading")
        addContactToDB(dispatch, outContact);
    }
  };

  useEffect(() => {
    addContact();
  }, []);

  return (
    <div className="contact-us container">
      {contactState.status === "add_contact_success" ? (
        <div className="card p-3"><h2>Thank you !</h2>
        <div className="card-text p-3">Thanks for contacting<br/><br/> <Logo/> <br/>We will get back to you soon.</div> 
        </div>
      ) : (
        <form id="contactUsForm">
          <h4>Contact Us</h4>
          <div className="row">
            <div className="col">
              <div className="mb-3">
                <label htmlFor="nameInput" className="form-label">
                  Full Name
                </label>
                <input
                  type="texts"
                  className="form-control"
                  id="nameInput"
                  name="contact_name"
                  placeholder=""
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="emailInput" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  name="contact_email"
                  className="form-control"
                  id="emailInput"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <PhoneInput
                  inputClass="form-control"
                  inputStyle={{ width: "100%" }}
                  country={"in"}
                  preferredCountries={["in", "uk", "us"]}
                  placeholder="Enter phone number"
                  value={value}
                  onChange={phoneNoChaged}
                  inputProps={{
                    name: "contact_phone",
                    required: true,
                    minlength: 7,
                  }}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="commentsTextArea" className="form-label">
                  Comments
                </label>
                <textarea
                  className="form-control"
                  id="commentsTextArea"
                  name="contact_comment"
                  rows={3}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
