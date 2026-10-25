jest.mock("./http-client", () => ({
  httpClient: {
    get: jest.fn().mockResolvedValue({ status: 200, data: {} }),
    put: jest.fn().mockResolvedValue({ status: 200, data: {} }),
  },
}));

import { httpClient } from "./http-client";
import { decryptData } from "./codec";
import {
  getArticleByAuthorAPI,
  getArticleByCategoryAPI,
  getArticleByMonthAPI,
  searchArticlesAPI,
  updateJournalAPI,
} from "./api";

const requestedQuery = () => {
  const url = new URL((httpClient.get as jest.Mock).mock.calls.at(-1)[0]);
  return Object.fromEntries(url.searchParams);
};

describe("public article queries", () => {
  test.each([
    ["category", () => getArticleByCategoryAPI("Art & Craft", true), { categryId: "Art & Craft" }],
    ["author", () => getArticleByAuthorAPI("Ada Lovelace", true), { author: "Ada Lovelace" }],
    ["month", () => getArticleByMonthAPI("2026-01", true), { createdAt_like: "2026-01" }],
  ])("by %s: only published articles that aren't on the purge list", (_, call, filters) => {
    call();
    expect(requestedQuery()).toEqual({ ...filters, published: "true", deleteFlag: "false" });
  });

  test("an empty author still builds a valid query", () => {
    getArticleByAuthorAPI("", true);
    expect((httpClient.get as jest.Mock).mock.calls.at(-1)[0]).toMatch(/\/articles\?published=true&deleteFlag=false$/);
  });

  test("admin queries aren't filtered", () => {
    getArticleByCategoryAPI("", false);
    expect((httpClient.get as jest.Mock).mock.calls.at(-1)[0]).toMatch(/\/articles$/);
  });
});

describe("searchArticlesAPI", () => {
  test("sends the search to /articles/search, encoded", () => {
    searchArticlesAPI({ q: "mars & water", view: "public", page: "2" });
    const url = new URL((httpClient.get as jest.Mock).mock.calls.at(-1)[0]);
    expect(url.pathname).toMatch(/\/articles\/search$/);
    expect(Object.fromEntries(url.searchParams)).toEqual({ q: "mars & water", view: "public", page: "2" });
  });
});

describe("updateJournalAPI", () => {
  test("doesn't store the editor's working copy with the journal", () => {
    updateJournalAPI({ title: "J", aboutUs: "x", currentArticle: { id: "draft" } } as any);

    const sent = decryptData((httpClient.put as jest.Mock).mock.calls.at(-1)[1]);
    expect(sent).toEqual({ title: "J", aboutUs: "x" });
  });
});

