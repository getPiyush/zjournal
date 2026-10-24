import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../../datastore/actions/JournalActions", () => ({
  updateJournalinDB: jest.fn(),
}));

import { AboutTemplate } from "./AboutTemplate";
import { AllProviders } from "../../../testUtils/renderWithProviders";
import { updateJournalinDB } from "../../../datastore/actions/JournalActions";
import { JournalLoader } from "../../../testUtils/JournalLoader";

describe("AboutTemplate", () => {
  test("disables saving until enough content is entered", () => {
    render(
      <AllProviders>
        <AboutTemplate />
      </AllProviders>
    );
    expect(screen.getByRole("button", { name: /Save Template/ })).toBeDisabled();
  });

  test("enables and triggers saving once enough content is entered", async () => {
    render(
      <AllProviders>
        <AboutTemplate />
      </AllProviders>
    );

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "<p>A sufficiently long about-us blurb</p>");

    const saveButton = screen.getByRole("button", { name: /Save Template/ });
    expect(saveButton).toBeEnabled();

    await userEvent.click(saveButton);
    await userEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: /Save Template/ })
    );

    expect(updateJournalinDB).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ aboutUs: "<p>A sufficiently long about-us blurb</p>" })
    );
  });

  test("shows the saved text when the journal loads after the page renders", () => {
    const { rerender } = render(
      <AllProviders>
        <JournalLoader journal={null} />
        <AboutTemplate />
      </AllProviders>
    );
    expect(screen.getByRole("textbox")).toHaveValue("");

    rerender(
      <AllProviders>
        <JournalLoader journal={{ aboutUs: "<p>About this journal and its author</p>" }} />
        <AboutTemplate />
      </AllProviders>
    );

    expect(screen.getByRole("textbox")).toHaveValue("<p>About this journal and its author</p>");
    // Nothing edited yet, so there's nothing to save.
    expect(screen.getByRole("button", { name: /Save Template/ })).toBeDisabled();
  });
});
