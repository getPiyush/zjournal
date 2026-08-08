import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../datastore/actions/ArticleActions", () => ({
  getArticlesToDelete: jest.fn(),
  deleteArticleinDB: jest.fn(),
}));

import { Purge } from "./Purge";
import { AllProviders } from "../../testUtils/renderWithProviders";
import {
  getArticlesToDelete,
  deleteArticleinDB,
} from "../../datastore/actions/ArticleActions";

describe("Purge", () => {
  test("fetches articles to delete on mount and lists them", () => {
    render(
      <AllProviders>
        <Purge />
      </AllProviders>
    );

    expect(getArticlesToDelete).toHaveBeenCalledWith(expect.any(Function));
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  test("confirms and deletes an article", async () => {
    render(
      <AllProviders>
        <Purge />
      </AllProviders>
    );

    await userEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(deleteArticleinDB).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Object)
    );
  });
});
