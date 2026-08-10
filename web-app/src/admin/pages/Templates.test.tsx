import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../datastore/actions/JournalActions", () => ({
  updateJournalinDB: jest.fn(),
}));
jest.mock("../../datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
}));
jest.mock("../../datastore/actions/QnAActions", () => ({
  getQnAsDB: jest.fn(),
  addQnAToDB: jest.fn(),
  deleteQnAFromDB: jest.fn(),
}));

import Templates from "./Templates";
import { AllProviders } from "../../testUtils/renderWithProviders";

describe("Templates", () => {
  test("defaults to the Home template", () => {
    render(
      <AllProviders>
        <Templates />
      </AllProviders>
    );
    expect(screen.getByRole("radio", { name: "Home" })).toBeChecked();
    expect(screen.getByRole("heading", { name: "Edit Home Page Template" })).toBeInTheDocument();
  });

  test("switches to the QnA template", async () => {
    render(
      <AllProviders>
        <Templates />
      </AllProviders>
    );

    await userEvent.click(screen.getByRole("radio", { name: "QnA" }));

    expect(screen.getByRole("heading", { name: "Edit QnA Page Template" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Q & A Template" })).toBeInTheDocument();
  });
});
