import { useEffect } from "react";
import { fireEvent, screen } from "@testing-library/react";

jest.mock("../datastore/actions/QnAActions", () => ({
  getQnAsDB: jest.fn(),
}));

import InterviewQA from "./InterviewAQ";
import { renderWithProviders } from "../testUtils/renderWithProviders";
import { getQnAsDB } from "../datastore/actions/QnAActions";
import { useQnA } from "../datastore/contexts/QnAContext";

// Simulates the questions arriving from the server.
function QnALoader({ action }: { action: any }) {
  const { dispatch } = useQnA();
  useEffect(() => dispatch(action), []);
  return null;
}

const renderPage = (action?: any) =>
  renderWithProviders(
    <>
      {action && <QnALoader action={action} />}
      <InterviewQA />
    </>
  );

const qna = (id: string, question: string, published = true) => ({
  id,
  question,
  answer: `<p>Answer to ${question}</p>`,
  published,
  createdAt: new Date(),
});

const loaded = (...value: any[]) => ({ type: "get_qnas_success", value });

const questionButtons = () =>
  screen.getAllByRole("button").filter((b) => b.classList.contains("accordion-button"));

describe("InterviewQA", () => {
  beforeEach(() => window.history.replaceState(null, "", "/"));

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
    renderPage(loaded(qna("3", "Newest?"), qna("2", "Draft?", false), qna("1", "Oldest?")));

    await screen.findByText("Oldest?");
    const buttons = questionButtons();
    expect(buttons.map((b) => b.textContent)).toEqual(["1.Oldest?", "2.Newest?"]);
    expect(buttons[0]).toHaveAttribute("aria-controls", "qna_1");
    expect(screen.queryByText(/Draft\?/)).toBeNull();
  });

  test("opens and closes a question, and questions with the same id open separately", async () => {
    renderPage(loaded(qna("4", "Second?"), qna("4", "First?")));

    await screen.findByText("First?");
    const [first, second] = questionButtons();
    expect(first).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("qna_1")).toHaveClass("show");
    expect(window.location.hash).toBe("#qna_1");

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(window.location.hash).toBe("");
  });

  test("expands and collapses every question", async () => {
    renderPage(loaded(qna("2", "B?"), qna("1", "A?")));

    fireEvent.click(await screen.findByRole("button", { name: "Expand all" }));
    questionButtons().forEach((b) => expect(b).toHaveAttribute("aria-expanded", "true"));

    fireEvent.click(screen.getByRole("button", { name: "Collapse all" }));
    questionButtons().forEach((b) => expect(b).toHaveAttribute("aria-expanded", "false"));
  });

  test("opens the question named in the address", async () => {
    window.history.replaceState(null, "", "/web/qna#qna_2");
    renderPage(loaded(qna("2", "B?"), qna("1", "A?")));

    await screen.findByText("B?");
    expect(questionButtons()[1]).toHaveAttribute("aria-expanded", "true");
  });

  test("searches questions and answers once there are enough of them", async () => {
    const many = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"].map((name, i) =>
      qna(String(i), `${name}?`)
    );
    renderPage(loaded(...many));

    const search = await screen.findByRole("searchbox", { name: "Search questions" });
    fireEvent.change(search, { target: { value: "answer to gamma" } });
    expect(questionButtons().map((b) => b.textContent)).toEqual(["4.Gamma?"]);

    fireEvent.change(search, { target: { value: "nothing like this" } });
    expect(screen.getByText(/No questions match/)).toBeInTheDocument();
  });

  test("hides the search box for a short list", async () => {
    renderPage(loaded(qna("1", "Only?")));
    await screen.findByText("Only?");
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  test("links to the contact page", () => {
    renderPage();
    expect(screen.getByRole("link", { name: "Ask us a question" })).toHaveAttribute(
      "href",
      "/web/contactus"
    );
  });

  test("shows an empty state when nothing is published", async () => {
    renderPage(loaded());
    expect(await screen.findByText("No questions have been answered yet.")).toBeInTheDocument();
  });

  test("shows an error when loading fails", async () => {
    renderPage({ type: "get_qnas_error" });
    expect(await screen.findByText(/couldn't be loaded/)).toBeInTheDocument();
  });
});
