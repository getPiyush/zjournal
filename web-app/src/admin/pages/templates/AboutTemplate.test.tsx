import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../../datastore/actions/JournalActions", () => ({
  updateJournalinDB: jest.fn(),
}));

import { AboutTemplate } from "./AboutTemplate";
import { AllProviders } from "../../../testUtils/renderWithProviders";
import { updateJournalinDB } from "../../../datastore/actions/JournalActions";

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
    await userEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(updateJournalinDB).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ aboutUs: "<p>A sufficiently long about-us blurb</p>" })
    );
  });
});
