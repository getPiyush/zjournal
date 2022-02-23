import React, { useContext } from "react";
import Blogs from "./Blogs";
import Categories from "./Categories";

type SidePanelProps = {
  pageContent: JSX.Element | string;
};

export default function SidePanel({ pageContent }: SidePanelProps) {
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
          {typeof(pageContent)==='string'?getSideContent(pageContent):pageContent}
        </div>
      </div>
    </React.Fragment>
  );
}
