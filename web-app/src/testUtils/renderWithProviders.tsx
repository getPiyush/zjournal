import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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

export function renderWithProviders(ui: ReactElement, { route = "/", ...options }: Options = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AllProviders>{ui}</AllProviders>
    </MemoryRouter>,
    options
  );
}
