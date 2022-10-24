import React from "react";
import { applicationProperties, months } from "../../../ApplicationConstants";
import { getMonths } from "../../../utils/componentUtil";

export default function Blogs() {
  const monthsYear = getMonths(
    applicationProperties.startDate,
    new Date().toISOString()
  );

  return (
    <React.Fragment>
      <div className="offcanvas-header">
        <h5>Blogs</h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="p-4">
          <span className="fst-italic">Archives</span>
          <ol className="list-unstyled mb-0">
            {monthsYear.map((monthY) => {
              return (
                <li>
                  <a href={`/web/articles?blogdate=${monthY.year}-${monthY.month<10?'0':''}${monthY.month+1}`}>{`${months[monthY.month]} ${monthY.year}`}</a>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="p-4">
          <span className="fst-italic">Elsewhere</span>
          <ol className="list-unstyled">
            <li>
              <a href="https://www.linkedin.com/in/chandrasekhar-panda-6a244a63/" target="_blank">LinkedIn</a>
            </li>
            <li>
              <a href="https://www.facebook.com/Chandrasekhar.panda.1983" target="_blank">Facebook</a>
            </li>
            <li>
              <a href="https://twitter.com/Chandra17877420" target="_blank">Twitter</a>
            </li>
            <li>
              <a href="https://api.whatsapp.com/send?phone=%2B917008217254&fbclid=IwAR2-fEp1i2H7pDq-r1Vgn2ka6z8jsO4GwHLJYvkWiiB0kVHaUpDUMJ81QMQ" target="_blank">WhatsApp</a>
            </li>
            <li>
              <a href="https://pharmaceuticalupdates.com/" target="_blank">Pharmaceutical Updates</a>
            </li>
          </ol>
        </div>
      </div>
    </React.Fragment>
  );
}
