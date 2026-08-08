import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ListEditor } from "./ListEditor";

describe("ListEditor", () => {
  test("calls updateListData on mount with the current list", () => {
    const updateListData = jest.fn();
    render(
      <ListEditor
        listData={{ componenType: "List", componentId: "l1", data: ["A", "B"], numbered: false }}
        updateListData={updateListData}
      />
    );

    expect(updateListData).toHaveBeenCalledWith(
      expect.objectContaining({ data: ["A", "B"], numbered: false })
    );
  });

  test("adds a new empty item when the add button is clicked", async () => {
    const { container } = render(
      <ListEditor
        listData={{ componenType: "List", componentId: "l1", data: ["A", "B"], numbered: false }}
        updateListData={jest.fn()}
      />
    );

    await userEvent.click(container.querySelector("#addButton") as HTMLElement);

    expect(screen.getAllByRole("textbox")).toHaveLength(3);
  });

  test("removes an item when its delete button is clicked", async () => {
    const { container } = render(
      <ListEditor
        listData={{ componenType: "List", componentId: "l1", data: ["A", "B", "C"], numbered: false }}
        updateListData={jest.fn()}
      />
    );

    await userEvent.click(container.querySelector('[id="0_deleteButton"]') as HTMLElement);

    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    expect(screen.queryByDisplayValue("A")).toBeNull();
  });

  test("toggles the numbered checkbox", async () => {
    const updateListData = jest.fn();
    render(
      <ListEditor
        listData={{ componenType: "List", componentId: "l1", data: ["A"], numbered: false }}
        updateListData={updateListData}
      />
    );

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Numbered Checkbox?" })
    );

    expect(updateListData).toHaveBeenLastCalledWith(
      expect.objectContaining({ numbered: true })
    );
  });
});
