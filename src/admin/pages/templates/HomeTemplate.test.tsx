import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../../datastore/actions/JournalActions", () => ({
  updateJournalinDB: jest.fn(),
}));
jest.mock("../../../datastore/actions/ArticleActions", () => ({
  getArticlesByIds: jest.fn(),
}));

import { HomeTemplate } from "./HomeTemplate";
import { AllProviders } from "../../../testUtils/renderWithProviders";

describe("HomeTemplate", () => {
  test("disables Preview until the template text changes", () => {
    render(
      <AllProviders>
        <HomeTemplate />
      </AllProviders>
    );
    expect(screen.getByRole("button", { name: "Preview" })).toBeDisabled();
  });

  test("enables Preview once the template text is edited", async () => {
    render(
      <AllProviders>
        <HomeTemplate />
      </AllProviders>
    );

    await userEvent.type(screen.getByRole("textbox"), "article-1");

    expect(screen.getByRole("button", { name: "Preview" })).toBeEnabled();
  });
});
