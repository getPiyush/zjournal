import ReactHtmlParser from "react-html-parser";

import { applicationProperties } from "../ApplicationConstants";
import { useJournal } from "../datastore/contexts/JournalContext";

export default function AboutUs() {
  window.document.title = `About Us - ${applicationProperties.title}`;
  const { state: jState } = useJournal();

  return (
    <div className="about-us container">
      {jState.journal.aboutUs === "" ? (
        <div className="row">
          <div className="col">
            <h4>About Us</h4>
            <b>Pharmaceutical Updates</b> was started to share knowledge among
            the pharma professionals &nbsp; it will become helpful to the pharma
            Professionals.
            <br />
            <img
              className="img-fluid"
              src="https://deejayfarm.com/wp-content/uploads/2019/10/Profile-pic.jpg"
            />
            The author of pharmaceutical updates is <b>Chandrasekhar Panda</b>{" "}
            who is having more than 13 years of Experience in Pharmaceutical
            Quality Assurance department and he has worked in Pharma Companies
            like Cipla, USV &nbsp; Aurobindo Pharma Limited.
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col">
            <div className="container">
              {ReactHtmlParser(jState.journal.aboutUs)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
