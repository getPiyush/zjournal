import { applicationProperties } from "../ApplicationConstants";

export default function AboutUs() {
    window.document.title = `About Us - ${applicationProperties.title}`;

  return (
    <div className="about-us container">
        <h4>About Us</h4>
      <b>Pharmaceutical Updates</b> was started to share knowledge among the pharma
      professionals &nbsp; it will become helpful to the pharma Professionals.
      <br />
      The author of pharmaceutical updates is <b>Chandrasekhar Panda</b> who is having
      more than 13 years of Experience in Pharmaceutical Quality Assurance
      department and he has worked in Pharma Companies like Cipla, USV &nbsp;
      Aurobindo Pharma Limited.
    </div>
  );
}
