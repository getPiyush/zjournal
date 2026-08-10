import { render, screen } from "@testing-library/react";

jest.mock("../datastore/actions/QnAActions", () => ({
  getQnAsDB: jest.fn(),
}));

import InterviewQA from "./InterviewAQ";
import { AllProviders } from "../testUtils/renderWithProviders";
import { getQnAsDB } from "../datastore/actions/QnAActions";

describe("InterviewQA", () => {
  test("fetches QnAs on mount", () => {
    render(
      <AllProviders>
        <InterviewQA />
      </AllProviders>
    );

    expect(getQnAsDB).toHaveBeenCalledWith(expect.any(Function));
    expect(screen.getByRole("heading", { name: /Questions & Answers/ })).toBeInTheDocument();
  });
});
