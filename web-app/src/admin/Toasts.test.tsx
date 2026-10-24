import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { notifyError, notifySuccess } from "../datastore/notifications";
import Toasts from "./Toasts";

describe("admin Toasts", () => {
  afterEach(() => jest.useRealTimers());

  test("shows a success message and hides it after a few seconds", () => {
    jest.useFakeTimers();
    render(<Toasts />);

    act(() => notifySuccess("Article saved"));
    expect(screen.getByRole("status")).toHaveTextContent("Article saved");

    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("keeps an error until it's dismissed", async () => {
    jest.useFakeTimers();
    render(<Toasts />);

    act(() => notifyError("Couldn't save the article", new Error("No item with that id")));
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save the article: No item with that id");

    jest.useRealTimers();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("shows at most four at once, newest last", () => {
    render(<Toasts />);

    act(() => {
      for (let i = 1; i <= 6; i++) notifyError(`Error ${i}`);
    });

    expect(screen.getAllByRole("alert").map((toast) => toast.textContent)).toEqual([
      "Error 3",
      "Error 4",
      "Error 5",
      "Error 6",
    ]);
  });

  test("stops listening once unmounted", () => {
    const { unmount } = render(<Toasts />);
    unmount();

    expect(() => act(() => notifyError("after unmount"))).not.toThrow();
  });
});
