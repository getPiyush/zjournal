import { useEffect } from "react";
import { render, screen } from "@testing-library/react";

jest.mock("../datastore/actions/QnAActions", () => ({
  getQnAsDB: jest.fn(),
}));

import InterviewQA from "./InterviewAQ";
import { AllProviders } from "../testUtils/renderWithProviders";
import { getQnAsDB } from "../datastore/actions/QnAActions";
import { useQnA } from "../datastore/contexts/QnAContext";

// Simulates the questions arriving from the server.
function QnALoader({ action }: { action: any }) {
  const { dispatch } = useQnA();
  useEffect(() => dispatch(action), []);
  return null;
}

const renderPage = (action?: any) =>
  render(
    <AllProviders>
      {action && <QnALoader action={action} />}
      <InterviewQA />
    </AllProviders>
  );

const qna = (id: string, question: string, published = true) => ({
  id,
  question,
  answer: `<p>Answer to ${question}</p>`,
  published,
  createdAt: new Date(),
});

describe("InterviewQA", () => {
  test("fetches only published QnAs on mount", () => {
    renderPage();

    expect(getQnAsDB).toHaveBeenCalledWith(expect.any(Function), true);
    expect(screen.getByRole("heading", { name: /Questions & Answers/ })).toBeInTheDocument();
    expect(document.title).toContain("Q&A");
  });

  test("shows a loading message before the questions arrive", () => {
    renderPage();
    expect(screen.getByText("Loading questions…")).toBeInTheDocument();
  });

  test("lists published questions oldest first and hides unpublished ones", async () => {
    // The server returns newest first.
    renderPage({
      type: "get_qnas_success",
      value: [qna("3", "Newest?"), qna("2", "Draft?", false), qna("1", "Oldest?")],
    });

    const buttons = await screen.findAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["1. Oldest?", "2. Newest?"]);
    expect(buttons[0]).toHaveAttribute("aria-controls", "qna_1");
    expect(screen.queryByText(/Draft\?/)).toBeNull();
  });

  test("shows an empty state when nothing is published", async () => {
    renderPage({ type: "get_qnas_success", value: [] });
    expect(await screen.findByText("No questions have been answered yet.")).toBeInTheDocument();
  });

  test("shows an error when loading fails", async () => {
    renderPage({ type: "get_qnas_error" });
    expect(await screen.findByText(/couldn't be loaded/)).toBeInTheDocument();
  });
});
