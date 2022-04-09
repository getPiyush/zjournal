import ReactHtmlParser from "react-html-parser";

import { useEffect } from "react";
import { getContactsDB } from "../../datastore/actions/ContactActions";
import { useContact } from "../../datastore/contexts/ContactContext";
import { getDate } from "../../utils/componentUtil";
import { PageTitle } from "../components/PageTitle";

export const Contacts = () => {
  const { dispatch, state: contactState } = useContact();

  useEffect(() => {
    getContactsDB(dispatch);
  }, []);

  return (
    <div className="contacts container">
      <div className="row">
        <div className="col">
          <PageTitle title="Contacts" />{" "}
        </div>
      </div>
      <div className="row">
        <div className="col">
          {contactState.status === "get_contacts_success" &&
            contactState.contacts.length > 0 && (
              <div
                className="accordion accordion-flush"
                id="accordionPanelsStayOpenContacts"
              >
                {contactState.contacts.map((contact, index) => (
                  <div className="accordion-item">
                    <div
                      className="accordion-header"
                      id={`panelsStayOpen-heading${index}`}
                    >
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#panelsStayOpen-collapse${index}`}
                        aria-expanded="true"
                        aria-controls={`panelsStayOpen-collapse${index}`}
                      >
                        <div
                          className="d-flex justify-content-between"
                          style={{ width: "100%", marginRight: "16px" }}
                        >
                          <div>
                            <b>
                              {index + 1}
                              {` . `}
                              {contact.name}
                            </b>
                          </div>
                          <div>{contact.phone}</div>
                          <div>{getDate(contact.dateContacted)}</div>
                        </div>
                      </button>
                    </div>
                    <div
                      id={`panelsStayOpen-collapse${index}`}
                      className="accordion-collapse collapse hide"
                      aria-labelledby="headingOne"
                      data-bs-parent="#accordionContacts"
                    >
                      <div className="accordion-body">
                        <strong>{contact.email}</strong>
                        <br />
                        <div className="text-break">
                          {ReactHtmlParser(contact.comment)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          <h1>{contactState.contacts.length} Total</h1>
        </div>
      </div>
    </div>
  );
};
