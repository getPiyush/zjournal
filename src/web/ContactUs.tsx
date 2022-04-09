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

  const contactUsSubmitted = (e) => {
    console.log(e);
    const { target } = e;
    console.log(e.target[0].value);
    console.log(e.target[1].value);
    console.log(e.target[2].value);
    console.log(e.target[3].value);

    const contactOut: Contact = {
      name: target[0].value,
      email: target[1].value,
      phone: target[2].value,
      comment: target[3].value,
      dateContacted: new Date(),
    };

    addContactToDB(dispatch, contactOut);

    e.stopPropagation();
    e.preventDefault();
  };

  const addContact = () => {
    if (submitableContact) {
      const paramObj = `{"${params
        .replace("?", "")
        .replace(/contact_/g, "")
        .split("&")
        .map((param) => {
          const valueArr = param.split("=");
          const decodedValues = [valueArr[0], decodeURIComponent(valueArr[1])];
          return decodedValues.join('":"');
        })
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
    // addContact();
  }, []);

  return (
    <div className="contact-us container">
      {contactState.status === "add_contact_success" ? (
        <div className="card p-3">
          <h2>Thank you !</h2>
          <div className="card-text p-3">
            Thanks for contacting
            <br />
            <br /> <Logo /> <br />
            We will get back to you soon.
          </div>
        </div>
      ) : (
        <form id="contactUsForm" onSubmit={contactUsSubmitted}>
          <h4>Contact Us</h4>
          <div className="row">
            <div className="col">
              <div className="mb-3">
                <label htmlFor="contactNameInput" className="form-label">
                  Full Name
                </label>
                <input
                  type="texts"
                  className="form-control"
                  id="contactNameInput"
                  name="contact_name"
                  placeholder=""
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contactEmailInput" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  id="contactEmailInput"
                  name="contact_email"
                  className="form-control"
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
