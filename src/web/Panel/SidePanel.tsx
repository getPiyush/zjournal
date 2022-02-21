import React, { useContext } from "react";
import Blogs from "./Blogs";
import Categories from "./Categories";

type HeaderProps = {
  selectedNav: string;
};

export default function SidePanel({ selectedNav }: HeaderProps) {
  // const sideNavState = useContext(SideNavContext);
  // console.log("sideNavState", sideNavState);
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
          {getSideContent(selectedNav)}
        </div>
      </div>
    </React.Fragment>
  );
}
