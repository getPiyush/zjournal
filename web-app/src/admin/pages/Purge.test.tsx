import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../datastore/actions/ArticleActions", () => ({
  getArticlesToDelete: jest.fn(),
  deleteArticleinDB: jest.fn(),
  deleteArticlesInDB: jest.fn(),
  restoreArticleInDB: jest.fn(),
}));

import { Purge } from "./Purge";
import { AllProviders } from "../../testUtils/renderWithProviders";
import {
  getArticlesToDelete,
  deleteArticleinDB,
  deleteArticlesInDB,
  restoreArticleInDB,
} from "../../datastore/actions/ArticleActions";

const article = (id: string, title: string, deleteFlag = true) => ({
  id,
  title,
  deleteFlag,
  author: "A",
  categryId: "Art",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  content: [],
  origin: "server",
  published: false,
});

// Stand in for the API: deliver these articles as the "flagged for deletion" list.
const serve = (articles: object[]) =>
  (getArticlesToDelete as jest.Mock).mockImplementation((dispatch) =>
    dispatch({ type: "get_articles_delete", value: articles })
  );

const renderPurge = () =>
  act(() => {
    render(
      <AllProviders>
        <Purge />
      </AllProviders>
    );
  });

describe("Purge", () => {
  test("fetches the flagged articles on mount and numbers them from 1", () => {
    serve([article("a", "First"), article("b", "Second")]);
    renderPurge();

    expect(getArticlesToDelete).toHaveBeenCalledWith(expect.any(Function));
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows.map((row) => within(row).getByRole("rowheader").textContent)).toEqual(["1", "2"]);
  });

  test("never offers to purge an article that isn't flagged for deletion", () => {
    serve([article("a", "Flagged"), article("live", "Live article", false)]);
    renderPurge();

    expect(screen.getByText("Flagged")).toBeInTheDocument();
    expect(screen.queryByText("Live article")).not.toBeInTheDocument();
  });

  test("says so when there's nothing to purge", () => {
    serve([]);
    renderPurge();

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText(/Nothing to purge/)).toBeInTheDocument();
  });

  test("confirms and deletes an article", async () => {
    serve([article("a", "First")]);
    renderPurge();

    await userEvent.click(screen.getByRole("button", { name: "Purge" }));
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Purge permanently" })
    );

    expect(deleteArticleinDB).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ id: "a" })
    );
  });

  test("restores an article without asking (it's undoable)", async () => {
    serve([article("a", "First")]);
    renderPurge();

    await userEvent.click(screen.getByRole("button", { name: "Restore" }));

    expect(restoreArticleInDB).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ id: "a" }));
  });

  test("bulk purge is disabled until something is selected", () => {
    serve([article("a", "First")]);
    renderPurge();

    expect(screen.getByRole("button", { name: /Purge selected \(0\)/ })).toBeDisabled();
  });

  test("select all, then purge them in one go", async () => {
    serve([article("a", "First"), article("b", "Second")]);
    renderPurge();

    await userEvent.click(screen.getByRole("checkbox", { name: "Select all" }));
    await userEvent.click(screen.getByRole("button", { name: /Purge selected \(2\)/ }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("2 articles will be deleted permanently");
    await userEvent.click(within(dialog).getByRole("button", { name: "Purge 2 permanently" }));

    expect(deleteArticlesInDB).toHaveBeenCalledWith(expect.any(Function), [
      expect.objectContaining({ id: "a" }),
      expect.objectContaining({ id: "b" }),
    ]);
  });

  test("purges only the rows that were ticked", async () => {
    serve([article("a", "First"), article("b", "Second")]);
    renderPurge();

    await userEvent.click(screen.getByRole("checkbox", { name: "Select article 2" }));
    expect(screen.getByRole("checkbox", { name: "Select all" })).not.toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: /Purge selected \(1\)/ }));
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "Purge 1 permanently" })
    );

    expect(deleteArticlesInDB).toHaveBeenCalledWith(expect.any(Function), [expect.objectContaining({ id: "b" })]);
  });
});
