import { render, screen } from "@testing-library/react";

import { List } from "./List";

const listData = {
  componenType: "List",
  componentId: "list1",
  data: ["Plan the launch", "Write the release notes", "Share with the team"],
  numbered: false,
};

describe("List", () => {
  test("renders an unordered list by default", () => {
    const { container } = render(<List listData={listData} />);
    expect(container.querySelector("ul")).not.toBeNull();
    expect(container.querySelector("ol")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  test("renders an ordered list when numbered", () => {
    const { container } = render(
      <List listData={{ ...listData, numbered: true }} />
    );
    expect(container.querySelector("ol")).not.toBeNull();
    expect(container.querySelector("ul")).toBeNull();
  });

  test("renders a single item when data is a plain string", () => {
    render(
      <List listData={{ ...listData, data: "Just one item" as any }} />
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Just one item")).toBeInTheDocument();
  });
});
