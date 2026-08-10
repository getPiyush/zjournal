jest.mock("../api");
jest.mock("../codec");

import {
  updatePage,
  updateCurrentArticle,
  getJournalFromDB,
  updateJournalinDB,
} from "./JournalActions";
import { getJournalAPI, updateJournalAPI } from "../api";
import { decryptData } from "../codec";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  jest.clearAllMocks();
  (decryptData as jest.Mock).mockImplementation((data) => data);
});

describe("updatePage", () => {
  test("dispatches the new page synchronously", () => {
    const dispatch = jest.fn();
    updatePage("about", dispatch);
    expect(dispatch).toHaveBeenCalledWith({ type: "update_page", value: "about" });
  });
});

describe("updateCurrentArticle", () => {
  test("dispatches the article synchronously", () => {
    const dispatch = jest.fn();
    const article: any = { id: "1" };
    updateCurrentArticle(article, dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: "update_current_article",
      value: article,
    });
  });
});

describe("getJournalFromDB", () => {
  test("dispatches loading then success with the decrypted journal", async () => {
    const dispatch = jest.fn();
    (getJournalAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue({ title: "My Journal" });

    getJournalFromDB(dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: "get_journal_loading" });
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: "get_journal_success",
      value: { title: "My Journal" },
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getJournalAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    getJournalFromDB(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_journal_error" });
  });
});

describe("updateJournalinDB", () => {
  const journal: any = { title: "My Journal" };

  test("dispatches loading then success with the decrypted journal", async () => {
    const dispatch = jest.fn();
    (updateJournalAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue(journal);

    updateJournalinDB(dispatch, journal);

    expect(dispatch).toHaveBeenCalledWith({ type: "update_journal_loading" });
    await flushPromises();

    expect(updateJournalAPI).toHaveBeenCalledWith(journal);
    expect(dispatch).toHaveBeenCalledWith({
      type: "update_journal_success",
      value: journal,
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (updateJournalAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    updateJournalinDB(dispatch, journal);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "update_journal_error" });
  });
});
