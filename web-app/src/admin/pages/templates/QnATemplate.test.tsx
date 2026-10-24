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

    const questionInput = screen.getByLabelText("Question");
    const answerInput = screen.getByLabelText("Answer");
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

  const fillAndSubmit = async () => {
    await userEvent.type(screen.getByLabelText("Question"), "What is zJournal?");
    await userEvent.type(screen.getByLabelText("Answer"), "A journaling app.");
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
  };

  test("clears the form once the question is added", async () => {
    (addQnAToDB as jest.Mock).mockImplementation((dispatch, qna) => {
      dispatch({ type: "add_qna_loading" });
      dispatch({ type: "add_qna_success", value: { ...qna, id: "q1" } });
    });
    render(
      <AllProviders>
        <QnATemplate />
      </AllProviders>
    );

    await fillAndSubmit();

    expect(screen.getByLabelText("Question")).toHaveValue("");
    expect(screen.getByLabelText("Answer")).toHaveValue("");
    expect(screen.getByText(/What is zJournal\?/)).toBeInTheDocument();
  });

  test("keeps what was typed when adding fails", async () => {
    (addQnAToDB as jest.Mock).mockImplementation((dispatch) => {
      dispatch({ type: "add_qna_loading" });
      dispatch({ type: "add_qna_error" });
    });
    render(
      <AllProviders>
        <QnATemplate />
      </AllProviders>
    );

    await fillAndSubmit();

    expect(screen.getByLabelText("Question")).toHaveValue("What is zJournal?");
    expect(screen.getByLabelText("Answer")).toHaveValue("A journaling app.");
  });

  test("keeps an opened answer open when the list re-renders", async () => {
    (getQnAsDB as jest.Mock).mockImplementation((dispatch) =>
      dispatch({
        type: "get_qnas_success",
        value: [{ id: "q1", question: "Why?", answer: "Because.", published: true, createdAt: new Date() }],
      })
    );
    render(
      <AllProviders>
        <QnATemplate />
      </AllProviders>
    );
    const answerPanel = document.getElementById("collapse_q1");

    // Typing re-renders the whole template; the row must be the same element afterwards.
    await userEvent.type(screen.getByLabelText("Question"), "x");

    expect(document.getElementById("collapse_q1")).toBe(answerPanel);
  });
});
