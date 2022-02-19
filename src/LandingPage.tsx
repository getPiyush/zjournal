import React from "react";
import Header from "./Header";
import Content from "./Content";
import Panel from "./SidePanel/Panel";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <React.Fragment>
      <Header />
      <Content />
      <Panel />
      <Footer />
    </React.Fragment>
  );
}
