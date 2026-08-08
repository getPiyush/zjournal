import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditPrompt from "./EditPrompt";

const paragraphComponent = {
  componenType: "Paragraph",
  componentId: "edit-text",
  data: "Edit this paragraph to see how the prompt behaves.",
};

describe("EditPrompt", () => {
  test("edits a default component through a textarea", () => {
    render(
      <EditPrompt
        component={paragraphComponent}
        onCancel={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Editing Paragraph" })
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(paragraphComponent.data)).toBeInTheDocument();
  });

  test("calls onUpdate with the edited data", async () => {
    const onUpdate = jest.fn();
    render(
      <EditPrompt
        component={paragraphComponent}
        onCancel={jest.fn()}
        onUpdate={onUpdate}
        onDelete={jest.fn()}
      />
    );

    const textarea = screen.getByDisplayValue(paragraphComponent.data);
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Updated text");
    await userEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: "Updated text" })
    );
  });

  test("calls onCancel when Cancel is clicked", async () => {
    const onCancel = jest.fn();
    render(
      <EditPrompt
        component={paragraphComponent}
        onCancel={onCancel}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("uses the List editor for a List component", () => {
    render(
      <EditPrompt
        component={{ componenType: "List", componentId: "l1", data: ["A", "B"], numbered: false }}
        onCancel={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(
      screen.getByRole("checkbox", { name: "Numbered Checkbox?" })
    ).toBeInTheDocument();
  });

  test("uses the Table editor for a Table component", () => {
    render(
      <EditPrompt
        component={{ componenType: "Table", componentId: "t1", data: "A|B", numbered: false }}
        onCancel={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(
      screen.getByRole("checkbox", { name: "Header (first row)?" })
    ).toBeInTheDocument();
  });
});
