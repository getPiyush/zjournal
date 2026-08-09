import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ArticlesToolbar from "./ArticlesToolbar";

describe("ArticlesToolbar", () => {
  test("renders the current search value and sort selection", () => {
    render(
      <ArticlesToolbar search="release" onSearchChange={() => {}} sortBy="title-asc" onSortChange={() => {}} />
    );

    expect(screen.getByRole("searchbox", { name: "Search articles" })).toHaveValue("release");
    expect(screen.getByRole("combobox", { name: "Sort articles" })).toHaveValue("title-asc");
  });

  test("calls onSearchChange as the user types", async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();
    render(
      <ArticlesToolbar search="" onSearchChange={onSearchChange} sortBy="newest" onSortChange={() => {}} />
    );

    await user.type(screen.getByRole("searchbox", { name: "Search articles" }), "abc");

    expect(onSearchChange).toHaveBeenCalledTimes(3);
    expect(onSearchChange).toHaveBeenLastCalledWith("c");
  });

  test("calls onSortChange when a new sort option is selected", async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();
    render(
      <ArticlesToolbar search="" onSearchChange={() => {}} sortBy="newest" onSortChange={onSortChange} />
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "Sort articles" }), "oldest");

    expect(onSortChange).toHaveBeenCalledWith("oldest");
  });
});
