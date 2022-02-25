import React, { useContext } from "react";
import Blogs from "./Blogs";
import Categories from "./Categories";

import { useJournal } from "../../../contexts/JournalContext";

export default function SidePanel() {
  const { state: state } = useJournal();
  const getSideContent = (nav: string) => {
    if (nav === "blogs") {
      return <Blogs />;
    } else {
      return <Categories />;
    }
  };

  return (
    <React.Fragment>
      <div id="blogPosts">
        <div
          className="offcanvas offcanvas-end"
          tabIndex={-1}
          id="offcanvasRight"
          aria-labelledby="offcanvasRightLabel"
        >
          {state?.journal?.selectedPage && getSideContent(state.journal.selectedPage)}
        </div>
      </div>
    </React.Fragment>
  );
}
