import { render, screen } from "@testing-library/react";

import { Table } from "./Table";

const tableData = {
  componenType: "Table",
  componentId: "table1",
  data: "Name|Role|Status\nAva|Engineering Lead|Active\nLeo|Product Designer|Review",
  numbered: false,
};

describe("Table", () => {
  test("renders every row without a header when not numbered", () => {
    const { container } = render(<Table tableData={tableData} />);
    expect(container.querySelector("thead")).toBeNull();
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Ava")).toBeInTheDocument();
  });

  test("renders the first row as a header when numbered", () => {
    const { container } = render(
      <Table tableData={{ ...tableData, numbered: true }} />
    );
    expect(container.querySelector("thead")).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.queryByText("Name", { selector: "td" })).toBeNull();
  });
});
