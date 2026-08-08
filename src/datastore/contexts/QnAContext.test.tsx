import { act, renderHook } from "@testing-library/react";

import { QnAProvider, useQnA } from "./QnAContext";

function setup() {
  return renderHook(() => useQnA(), {
    wrapper: ({ children }) => <QnAProvider>{children}</QnAProvider>,
  });
}

describe("useQnA", () => {
  test("throws when used outside of a QnAProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useQnA())).toThrow(
      "useQnA must be used within a QnAProvider"
    );
    consoleError.mockRestore();
  });

  test("starts with the default qna and an empty status", () => {
    const { result } = setup();
    expect(result.current.state.status).toBe("");
    expect(result.current.state.qnas).toHaveLength(1);
  });

  test.each([
    ["get_qnas_loading", "get_qnas_loading"],
    ["get_qnas_error", "get_qnas_error"],
    ["add_qna_loading", "add_qna_loading"],
    ["add_qna_error", "add_qna_error"],
    ["delete_qna_loading", "delete_qna_loading"],
    ["delete_qna_success", "delete_qna_success"],
    ["delete_qna_error", "delete_qna_error"],
  ])("%s sets status to %s while preserving the qna list", (type, status) => {
    const { result } = setup();
    const qnasBefore = result.current.state.qnas;

    act(() => {
      result.current.dispatch({ type } as any);
    });

    expect(result.current.state.status).toBe(status);
    expect(result.current.state.qnas).toBe(qnasBefore);
  });

  test("get_qnas_success replaces the qna list", () => {
    const { result } = setup();
    const qnas: any = [{ question: "Q1" }, { question: "Q2" }];

    act(() => {
      result.current.dispatch({ type: "get_qnas_success", value: qnas });
    });

    expect(result.current.state).toEqual({ status: "get_qnas_success", qnas });
  });

  test("add_qna_success prepends the new qna to the existing list", () => {
    const { result } = setup();
    const qnasBefore = result.current.state.qnas;
    const newQna: any = { question: "New Q", answer: "New A" };

    act(() => {
      result.current.dispatch({ type: "add_qna_success", value: newQna });
    });

    expect(result.current.state.status).toBe("add_qna_success");
    expect(result.current.state.qnas).toEqual([newQna, ...qnasBefore]);
  });

  test("an unhandled action type throws", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const { result } = setup();

    expect(() => {
      act(() => {
        result.current.dispatch({ type: "not_a_real_action" } as any);
      });
    }).toThrow();

    consoleError.mockRestore();
  });
});
