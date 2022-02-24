import React, { useState } from "react";
import Header from "./Header";
import Content from "./Content";
import SidePanel from "./components/Panel/SidePanel";
import Footer from "./Footer";

export default function LandingPage() {
  const [selectedSideNav, setSelectedSideNav] = useState("");


  return (
    <React.Fragment>
      <Header updateSideNav={function (name: string): void {
        setSelectedSideNav(name);
      } } />
      <Content/>
      <SidePanel pageContent={selectedSideNav} />
      <Footer />
    </React.Fragment>
  );
}
