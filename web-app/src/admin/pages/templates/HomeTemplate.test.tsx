import { render, screen, waitFor } from "@testing-library/react";
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

  describe("Auto generate", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
      jest.restoreAllMocks();
    });

    test("ranks the most-read articles into a hero/3/5/5 row layout", async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          articles: Array.from({ length: 14 }, (_, i) => ({
            articleId: `article-${i + 1}`,
            views: 14 - i,
          })),
        }),
      });
      global.fetch = fetchMock as any;

      render(
        <AllProviders>
          <HomeTemplate />
        </AllProviders>
      );

      await userEvent.click(
        screen.getByRole("button", { name: "Auto generate" })
      );

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/applications/web-app/stats")
      );

      const expectedTemplate = [
        "article-1",
        "article-2|article-3|article-4",
        "article-5|article-6|article-7|article-8|article-9",
        "article-10|article-11|article-12|article-13|article-14",
      ].join("\n");

      await waitFor(() =>
        expect(screen.getByRole("textbox")).toHaveValue(expectedTemplate)
      );
    });

    test("shows an error when analytics has no data yet", async () => {
      const fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 404 });
      global.fetch = fetchMock as any;

      render(
        <AllProviders>
          <HomeTemplate />
        </AllProviders>
      );

      await userEvent.click(
        screen.getByRole("button", { name: "Auto generate" })
      );

      expect(
        await screen.findByText(
          "No analytics data recorded yet — read some articles first."
        )
      ).toBeInTheDocument();
    });
  });
});
