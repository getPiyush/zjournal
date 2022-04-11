import { useState } from "react";

import { PageTitle } from "../components/PageTitle";
import { AboutTemplate } from "./templates/AboutTemplate";
import { HomeTemplate } from "./templates/HomeTemplate";
import { QnATemplate } from "./templates/QnATemplate";

const templateModeInit: "Home" | "About" | "QnA" = "Home";

export default function Templates() {
  const [templateMode, setTemplateMode] = useState(templateModeInit);

  return (
    <div className="template container">
      <div className="row">
        <div className="col">
          <PageTitle title={`Edit ${templateMode} Page Template`} />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div
            className="btn-group"
            role="group"
            aria-label="Basic radio toggle button group"
          >
            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio1"
              autoComplete="off"
              onChange={() => {
                setTemplateMode("Home");
              }}
              checked={templateMode === "Home"}
            />
            <label className="btn btn-outline-primary" htmlFor="btnradio1">
              Home
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio2"
              autoComplete="off"
              onChange={() => {
                setTemplateMode("About");
              }}
              checked={templateMode === "About"}
            />
            <label className="btn btn-outline-primary" htmlFor="btnradio2">
              About
            </label>

            <input
              type="radio"
              className="btn-check"
              name="btnradio"
              id="btnradio3"
              autoComplete="off"
              onChange={() => {
                setTemplateMode("QnA");
              }}
              checked={templateMode === "QnA"}
            />
            <label className="btn btn-outline-primary" htmlFor="btnradio3">
              QnA
            </label>
          </div>
          <hr />
        </div>
      </div>
      <div className="row">
        <div className="col">
          {templateMode === "Home" && <HomeTemplate/>}
          {templateMode === "About" && <AboutTemplate/>}
          {templateMode === "QnA" && <QnATemplate/>}
        </div>
      </div>
    </div>
  );
}
