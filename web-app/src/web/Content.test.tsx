import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
  getArticleById: jest.fn(),
  getArticlesBycategory: jest.fn(),
  getArticlesByBlogDate: jest.fn(),
}));
jest.mock("../datastore/actions/ContactActions", () => ({
  addContactToDB: jest.fn(),
}));
jest.mock("../datastore/actions/QnAActions", () => ({
  getQnAsDB: jest.fn(),
}));

import Content from "./Content";
import { AllProviders } from "../testUtils/renderWithProviders";

// Content's own <Routes> uses paths relative to a "web/*" ancestor route
// (provided by AppRoot in the real app), so it must be mounted the same way here.
function renderContent(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AllProviders>
        <Routes>
          <Route path="web/*" element={<Content />} />
        </Routes>
      </AllProviders>
    </MemoryRouter>
  );
}

describe("Content", () => {
  test("routes /web/contactus to the ContactUs page", () => {
    renderContent("/web/contactus");
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
  });

  test("routes /web/iqa to the InterviewQA page", () => {
    renderContent("/web/iqa");
    expect(screen.getByRole("heading", { name: /Questions & Answers/ })).toBeInTheDocument();
  });

  test("falls back to Home for an unmatched path", () => {
    renderContent("/web/does-not-exist");
    expect(screen.getByText(/Please wait while the Article gets loaded/)).toBeInTheDocument();
  });
});
