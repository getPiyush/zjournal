import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ArticlesToolbar from "./ArticlesToolbar";
import { ArticleFilters, emptyArticleFilters } from "./articleFilters";

// A toolbar that keeps its own filter state, reporting each change.
function Controlled({ initial = emptyArticleFilters, onChange = () => {}, ...props }: any) {
  const [filters, setFilters] = useState<ArticleFilters>(initial);
  return (
    <ArticlesToolbar
      filters={filters}
      onFiltersChange={(next) => {
        setFilters(next);
        onChange(next);
      }}
      sortBy="newest"
      onSortChange={() => {}}
      {...props}
    />
  );
}

describe("ArticlesToolbar", () => {
  test("renders the current search value and sort selection", () => {
    render(
      <ArticlesToolbar
        filters={{ ...emptyArticleFilters, search: "release" }}
        onFiltersChange={() => {}}
        sortBy="title-asc"
        onSortChange={() => {}}
      />
    );

    expect(screen.getByRole("searchbox", { name: "Search articles" })).toHaveValue("release");
    expect(screen.getByRole("combobox", { name: "Sort articles" })).toHaveValue("title-asc");
  });

  test("reports the search as the user types", async () => {
    const onChange = jest.fn();
    render(<Controlled onChange={onChange} />);

    await userEvent.type(screen.getByRole("searchbox", { name: "Search articles" }), "abc");

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ search: "abc" }));
  });

  test("calls onSortChange when a new sort option is selected", async () => {
    const onSortChange = jest.fn();
    render(
      <ArticlesToolbar filters={emptyArticleFilters} onFiltersChange={() => {}} sortBy="newest" onSortChange={onSortChange} />
    );

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Sort articles" }), "oldest");

    expect(onSortChange).toHaveBeenCalledWith("oldest");
  });

  test("picks which field to search, with a matching placeholder", async () => {
    const onChange = jest.fn();
    render(<Controlled onChange={onChange} />);

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Search in" }), "id");

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ field: "id" }));
    expect(screen.getByRole("searchbox")).toHaveAttribute("placeholder", "Article ID...");
  });

  test("sets a date range from the filters panel", async () => {
    const onChange = jest.fn();
    render(<Controlled onChange={onChange} />);

    expect(screen.queryByLabelText("From")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    await userEvent.type(screen.getByLabelText("From"), "2026-01-01");
    await userEvent.type(screen.getByLabelText("To"), "2026-03-31");

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ from: "2026-01-01", to: "2026-03-31" }));
    // Each end limits the other, so the picker can't build a backwards range.
    expect(screen.getByLabelText("To")).toHaveAttribute("min", "2026-01-01");
    expect(screen.getByLabelText("From")).toHaveAttribute("max", "2026-03-31");
    expect(screen.getByRole("button", { name: /Filters/ })).toHaveTextContent("Filters2");
  });

  test("offers the status filter only when asked", async () => {
    const { unmount } = render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.queryByLabelText("Status")).toBeNull();
    unmount();

    const onChange = jest.fn();
    render(<Controlled showStatusFilter onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    await userEvent.selectOptions(screen.getByLabelText("Status"), "draft");
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: "draft" }));
  });

  test("opens the filters panel when filters are already set", () => {
    render(<Controlled initial={{ ...emptyArticleFilters, from: "2026-01-01" }} />);
    expect(screen.getByLabelText("From")).toHaveValue("2026-01-01");
  });

  test("shows the result count and clears everything but the search field choice", async () => {
    const onChange = jest.fn();
    render(
      <Controlled
        initial={{ ...emptyArticleFilters, search: "mars", field: "title", from: "2026-01-01" }}
        onChange={onChange}
        shownCount={2}
        totalCount={40}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Showing 2 of 40 articles");
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(onChange).toHaveBeenLastCalledWith({ ...emptyArticleFilters, field: "title" });
    expect(screen.queryByRole("status")).toBeNull();
  });
});
