import { act, renderHook } from "@testing-library/react";

import { JournalProvider, useJournal } from "./JournalContext";
import { defaultJournal } from "../../ApplicationConstants";

function setup() {
  return renderHook(() => useJournal(), {
    wrapper: ({ children }) => <JournalProvider>{children}</JournalProvider>,
  });
}

describe("useJournal", () => {
  test("throws when used outside of a JournalProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useJournal())).toThrow(
      "useJournal must be used within a JournalProvider"
    );
    consoleError.mockRestore();
  });

  test("starts with the default journal and an empty status", () => {
    const { result } = setup();
    expect(result.current.state.status).toBe("");
    expect(result.current.state.journal).toEqual(defaultJournal);
  });

  test.each([
    ["get_journal_loading", "loading"],
    ["get_journal_error", "error"],
    ["update_journal_loading", "loading"],
    ["update_journal_error", "error"],
  ])("%s sets status to %s while preserving the journal", (type, status) => {
    const { result } = setup();
    const journalBefore = result.current.state.journal;

    act(() => {
      result.current.dispatch({ type } as any);
    });

    expect(result.current.state.status).toBe(status);
    expect(result.current.state.journal).toBe(journalBefore);
  });

  test("get_journal_success replaces the journal", () => {
    const { result } = setup();
    const journal: any = { title: "Fetched Journal" };

    act(() => {
      result.current.dispatch({ type: "get_journal_success", value: journal });
    });

    expect(result.current.state).toEqual({ status: "success", journal });
  });

  test("update_journal_success replaces the journal", () => {
    const { result } = setup();
    const journal: any = { title: "Updated Journal" };

    act(() => {
      result.current.dispatch({ type: "update_journal_success", value: journal });
    });

    expect(result.current.state).toEqual({ status: "success", journal });
  });

  test("update_page only updates the selected page", () => {
    const { result } = setup();

    act(() => {
      result.current.dispatch({ type: "update_page", value: "about" });
    });

    expect(result.current.state.journal.selectedPage).toBe("about");
    expect(result.current.state.status).toBe("");
    expect(result.current.state.journal.currentArticle).toEqual(
      defaultJournal.currentArticle
    );
  });

  test("reset_page resets the selected page to home", () => {
    const { result } = setup();

    act(() => {
      result.current.dispatch({ type: "update_page", value: "about" });
    });
    act(() => {
      result.current.dispatch({ type: "reset_page" });
    });

    expect(result.current.state.journal.selectedPage).toBe("home");
  });

  test("update_current_article only updates the current article", () => {
    const { result } = setup();
    const article: any = { id: "1", title: "Current" };

    act(() => {
      result.current.dispatch({ type: "update_current_article", value: article });
    });

    expect(result.current.state.journal.currentArticle).toEqual(article);
    expect(result.current.state.journal.selectedPage).toBe(
      defaultJournal.selectedPage
    );
  });

  test("an unhandled action type throws", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = setup();

    expect(() => {
      act(() => {
        result.current.dispatch({ type: "not_a_real_action" } as any);
      });
    }).toThrow();

    consoleError.mockRestore();
  });
});
