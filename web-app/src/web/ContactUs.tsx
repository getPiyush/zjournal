import React, { useEffect, useState } from "react";

import { useContact } from "../datastore/contexts/ContactContext";
import { addContactToDB } from "../datastore/actions/ContactActions";
import { applicationProperties } from "../ApplicationConstants";
import { Contact, Logo } from "@zjournal/ui-library";

export default function ContactUs() {
  const { dispatch, state: contactState } = useContact();
  // Only show the thank-you for a message sent from this visit to the page: the contact status
  // lives in app-wide context, so it would otherwise still say "success" on the next visit.
  const [submitted, setSubmitted] = useState(false);

  const sending = submitted && contactState.status === "add_contact_loading";
  const sent = submitted && contactState.status === "add_contact_success";
  const failed = submitted && contactState.status === "add_contact_error";

  useEffect(() => {
    window.document.title = `Contact Us - ${applicationProperties.title}`;
  }, []);

  const contactUsSubmitted = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (sending) return;

    const form = new FormData(e.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    const phone = field("contact_phone");

    const contactOut: Contact = {
      name: field("contact_name"),
      email: field("contact_email"),
      ...(phone && { phone }),
      comment: field("contact_comment"),
      createdAt: new Date(),
    };

    setSubmitted(true);
    addContactToDB(dispatch, contactOut);
  };

  return (
    <div className="contact-us container">
      {sent ? (
        <div className="card p-3">
          <h2>Thank you !</h2>
          <div className="card-text p-3">
            Thanks for contacting
            <br />
            <br /> <Logo subtext={`by ${applicationProperties.author}`} /> <br />
            We will get back to you soon.
          </div>
          <div>
            <button type="button" className="btn btn-link px-0" onClick={() => setSubmitted(false)}>
              Send another message
            </button>
          </div>
        </div>
      ) : (
        <form id="contactUsForm" onSubmit={contactUsSubmitted}>
          <h4>Contact</h4>
          <div className="row">
            <div className="col">
              <div className="mb-3">
                <label htmlFor="contactNameInput" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contactNameInput"
                  name="contact_name"
                  autoComplete="name"
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
                  autoComplete="email"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contactPhoneInput" className="form-label">
                  Phone Number <span className="text-muted small">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="contactPhoneInput"
                  className="form-control"
                  name="contact_phone"
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  minLength={7}
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
              {failed && (
                <div className="alert alert-danger" role="alert">
                  Your message couldn't be sent. Please try again.
                </div>
              )}
              <div className="mb-3">
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? "Sending…" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
