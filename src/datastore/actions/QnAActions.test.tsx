jest.mock("../api");
jest.mock("../codec");

import { getQnAsDB, addQnAToDB, deleteQnAFromDB } from "./QnAActions";
import { addQnAAPI, deleteQnAAPI, getQnAsAPI } from "../api";
import { decryptData } from "../codec";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  jest.clearAllMocks();
  (decryptData as jest.Mock).mockImplementation((data) => data);
  (getQnAsAPI as jest.Mock).mockResolvedValue({ data: {} });
});

describe("getQnAsDB", () => {
  test("dispatches loading then success with decrypted qnas", async () => {
    const dispatch = jest.fn();
    (decryptData as jest.Mock).mockReturnValue([{ question: "Q1" }]);

    getQnAsDB(dispatch);

    expect(dispatch).toHaveBeenCalledWith({ type: "get_qnas_loading" });
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({
      type: "get_qnas_success",
      value: [{ question: "Q1" }],
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (getQnAsAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    getQnAsDB(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "get_qnas_error" });
  });
});

describe("addQnAToDB", () => {
  const qna: any = { question: "Q1", answer: "A1" };

  test("dispatches loading then success with the decrypted qna", async () => {
    const dispatch = jest.fn();
    (addQnAAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValue(qna);

    addQnAToDB(dispatch, qna);

    expect(dispatch).toHaveBeenCalledWith({ type: "add_qna_loading" });
    await flushPromises();

    expect(addQnAAPI).toHaveBeenCalledWith(qna);
    expect(dispatch).toHaveBeenCalledWith({
      type: "add_qna_success",
      value: qna,
    });
  });

  test("dispatches an error action when the API call fails", async () => {
    const dispatch = jest.fn();
    (addQnAAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    addQnAToDB(dispatch, qna);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "add_qna_error" });
  });
});

describe("deleteQnAFromDB", () => {
  test("dispatches loading then success, and refetches the qna list", async () => {
    const dispatch = jest.fn();
    (deleteQnAAPI as jest.Mock).mockResolvedValue({ data: {} });
    (decryptData as jest.Mock).mockReturnValueOnce({ id: "1" });

    deleteQnAFromDB(dispatch, "1");

    expect(dispatch).toHaveBeenCalledWith({ type: "delete_qna_loading" });
    await flushPromises();

    expect(deleteQnAAPI).toHaveBeenCalledWith("1");
    expect(dispatch).toHaveBeenCalledWith({
      type: "delete_qna_success",
      value: { id: "1" },
    });
    // deleteQnAFromDB re-fetches the list on success
    expect(getQnAsAPI).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({ type: "get_qnas_loading" });
  });

  test("dispatches an error action when the API call fails, without refetching", async () => {
    const dispatch = jest.fn();
    (deleteQnAAPI as jest.Mock).mockRejectedValue(new Error("boom"));

    deleteQnAFromDB(dispatch, "1");
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith({ type: "delete_qna_error" });
    expect(getQnAsAPI).not.toHaveBeenCalled();
  });
});
