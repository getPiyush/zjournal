import { Outlet, useLocation, useNavigation } from "react-router-dom";
import { Suspense, useEffect } from "react";

import { LoadingPage } from "../remotes/uiLibraryComponents";

export default function Content() {
  const navigation = useNavigation();
  const showLoader = navigation.state === "loading";

  const location = useLocation().pathname;

  const preventDefaultDelegate = (e: any) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (location === "/article") {
      document.addEventListener("contextmenu", preventDefaultDelegate);
      return () => {
        document.removeEventListener("contextmenu", preventDefaultDelegate);
      };
    }

    return () => {
      document.removeEventListener("contextmenu", preventDefaultDelegate);
    };
  }, [location]);

  return (
    <main className="flex-shrink-0">
      {showLoader && (
        <Suspense fallback={null}>
          <LoadingPage />
        </Suspense>
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </main>
  );
}
