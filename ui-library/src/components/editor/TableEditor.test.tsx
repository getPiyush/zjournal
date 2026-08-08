import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TableEditor } from "./TableEditor";

describe("TableEditor", () => {
  test("calls updateTableData on mount with the current data", () => {
    const updateTableData = jest.fn();
    render(
      <TableEditor
        tableData={{ componenType: "Table", componentId: "t1", data: "A|B\nC|D", numbered: false }}
        updateTableData={updateTableData}
      />
    );

    expect(updateTableData).toHaveBeenCalledWith(
      expect.objectContaining({ data: "A|B\nC|D", numbered: false })
    );
  });

  test("renders a live preview of the table data", () => {
    render(
      <TableEditor
        tableData={{ componenType: "Table", componentId: "t1", data: "A|B\nC|D", numbered: false }}
        updateTableData={jest.fn()}
      />
    );

    expect(screen.getByRole("textbox")).toHaveValue("A|B\nC|D");
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  test("toggles the header checkbox", async () => {
    const updateTableData = jest.fn();
    render(
      <TableEditor
        tableData={{ componenType: "Table", componentId: "t1", data: "A|B\nC|D", numbered: false }}
        updateTableData={updateTableData}
      />
    );

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Header (first row)?" })
    );

    expect(updateTableData).toHaveBeenLastCalledWith(
      expect.objectContaining({ numbered: true })
    );
  });
});
