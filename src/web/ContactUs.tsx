import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { applicationProperties } from "../ApplicationConstants";
import { useState } from "react";

export default function ContactUs() {
  window.document.title = `Contact Us - ${applicationProperties.title}`;
  const [value, setValue] = useState();

  const phoneNoChaged = (phoneNo) => {
    setValue(phoneNo);
  };

  return (
    <div className="contact-us container">
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
              placeholder=""
            />
          </div>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="emailInput"
              placeholder="name@example.com"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <PhoneInput
             inputClass="form-control"
              country={"in"}
              preferredCountries={["in", "uk", "us"]}
              placeholder="Enter phone number"
              value={value}
              onChange={phoneNoChaged}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="commentsTextArea" className="form-label">
              Comments
            </label>
            <textarea
              className="form-control"
              id="commentsTextArea"
              rows={3}
            ></textarea>
          </div>
          <div className="mb-3">
            <button type="button" className="btn btn-primary">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
