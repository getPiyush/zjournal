import React from "react";

type SidePanelProps = {
  pageContent: JSX.Element;
};

export default function SidePanel({ pageContent }: SidePanelProps) {
  return (
    <React.Fragment>
      <div id="blogPosts">
        <div
          className="offcanvas offcanvas-end"
          tabIndex={-1}
          id="offcanvasRight"
          aria-labelledby="offcanvasRightLabel"
        >
          {pageContent}
        </div>
      </div>
    </React.Fragment>
  );
}
