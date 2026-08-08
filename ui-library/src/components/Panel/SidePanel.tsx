import React from "react";
import Blogs from "./Blogs";
import Categories from "./Categories";

type SidePanelProps = {
  selectedPage?: string;
  categories: string[];
  startDate: string;
};

export default function SidePanel({ selectedPage, categories, startDate }: SidePanelProps) {
  const getSideContent = (nav: string) => {
    if (nav === "blogs") {
      return <Blogs startDate={startDate} />;
    } else {
      return <Categories categories={categories} />;
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
          {selectedPage && getSideContent(selectedPage)}
        </div>
      </div>
    </React.Fragment>
  );
}
