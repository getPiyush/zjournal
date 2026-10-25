import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Pagination, getPageItems } from "./Pagination";

describe("getPageItems", () => {
  test("lists every page when there are only a few", () => {
    expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
  });

  test("collapses distant pages into ellipses around the current page", () => {
    expect(getPageItems(5, 10)).toEqual([1, "ellipsis-start", 4, 5, 6, "ellipsis-end", 10]);
  });

  test("skips the leading ellipsis near the start", () => {
    expect(getPageItems(2, 10)).toEqual([1, 2, 3, "ellipsis-end", 10]);
  });
});

describe("Pagination", () => {
  test("renders nothing when there is a single page", () => {
    const { container } = render(<Pagination page={1} pageCount={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("marks the current page and disables Previous on the first page", () => {
    render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  test("calls onPageChange with the chosen page", async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pagination page={2} pageCount={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Page 3" }));
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("button", { name: "Page 2" }));

    expect(onPageChange.mock.calls).toEqual([[3], [1]]);
  });
});
