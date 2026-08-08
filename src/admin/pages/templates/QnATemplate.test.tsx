import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../../datastore/actions/QnAActions", () => ({
  getQnAsDB: jest.fn(),
  addQnAToDB: jest.fn(),
  deleteQnAFromDB: jest.fn(),
}));

import { QnATemplate } from "./QnATemplate";
import { AllProviders } from "../../../testUtils/renderWithProviders";
import { getQnAsDB, addQnAToDB } from "../../../datastore/actions/QnAActions";

describe("QnATemplate", () => {
  test("fetches QnAs on mount", () => {
    render(
      <AllProviders>
        <QnATemplate />
      </AllProviders>
    );
    expect(getQnAsDB).toHaveBeenCalledWith(expect.any(Function));
  });

  test("submits a new question and answer", async () => {
    render(
      <AllProviders>
        <QnATemplate />
      </AllProviders>
    );

    const [questionInput, answerInput] = screen.getAllByRole("textbox");
    await userEvent.type(questionInput, "What is zJournal?");
    await userEvent.type(answerInput, "A journaling app.");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(addQnAToDB).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        question: "What is zJournal?",
        answer: "A journaling app.",
      })
    );
  });
});
