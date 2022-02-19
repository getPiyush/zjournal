import React, { useContext } from "react";
import Blogs from "./Blogs";
import Categories from "./Categories";

export default function Panel() {
  // const sideNavState = useContext(SideNavContext);
  // console.log("sideNavState", sideNavState);
  const getSideContent = (selectedNav: string) => {
    if (selectedNav === "blog") {
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
          {getSideContent("blog")}
        </div>
      </div>
    </React.Fragment>
  );
}
