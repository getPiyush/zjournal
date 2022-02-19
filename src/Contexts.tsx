import { createContext, useState } from "react";

export default SideNavContext = createContext({
  sideNav: "",
  setSideNav: (sideNavText: string) => {}
});
/*
function SideNavProvider({ children }) => {

  const [sideNav, setSideNav]s = useState("");

  return (
    <SideNavContext.Provider value={(sideNav, setSideNav)}>
      {children}
    </SideNavContext.Provider>
  );
}

export { SideNavContext, SideNavProvider };
*/
