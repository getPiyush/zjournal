import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { JournalProvider } from "../datastore/contexts/JournalContext";
import { ArticleProvider } from "../datastore/contexts/ArticleContext";
import { ContactProvider } from "../datastore/contexts/ContactContext";
import { QnAProvider } from "../datastore/contexts/QnAContext";

type Options = Omit<RenderOptions, "wrapper"> & { route?: string };

export function AllProviders({ children }: { children: ReactNode }) {
  return (
    <JournalProvider>
      <ArticleProvider>
        <ContactProvider>
          <QnAProvider>{children}</QnAProvider>
        </ContactProvider>
      </ArticleProvider>
    </JournalProvider>
  );
}

// A data router (like the real app's createBrowserRouter), so components using useBlocker work.
// Returns the router too, for tests that navigate.
export function renderWithProviders(ui: ReactElement, { route = "/", ...options }: Options = {}) {
  const router = createMemoryRouter([{ path: "*", element: <AllProviders>{ui}</AllProviders> }], {
    initialEntries: [route],
  });
  return { router, ...render(<RouterProvider router={router} />, options) };
}
