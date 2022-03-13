import { applicationProperties } from "../ApplicationConstants";

export default function ContactUs() {
  window.document.title = `Contact Us - ${applicationProperties.title}`;

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
