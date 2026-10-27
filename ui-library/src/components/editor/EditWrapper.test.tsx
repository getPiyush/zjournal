import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditWrapper, { DRAG_DATA_TYPE } from "./EditWrapper";

describe("EditWrapper", () => {
  test("renders its children inside a clickable wrapper with the given id", () => {
    render(
      <EditWrapper id="comp-1" componentClicked={jest.fn()}>
        <p>Wrapped content</p>
      </EditWrapper>
    );

    const wrapper = screen.getByRole("button");
    expect(wrapper.id).toBe("comp-1");
    expect(screen.getByText("Wrapped content")).toBeInTheDocument();
  });

  test("calls componentClicked when clicked", async () => {
    const componentClicked = jest.fn();
    render(
      <EditWrapper id="comp-1" componentClicked={componentClicked}>
        <p>Wrapped content</p>
      </EditWrapper>
    );

    await userEvent.click(screen.getByRole("button"));

    expect(componentClicked).toHaveBeenCalledTimes(1);
  });

  const createDataTransfer = () => {
    const data: Record<string, string> = {};
    return {
      setData: (type: string, value: string) => { data[type] = value; },
      getData: (type: string) => data[type] || "",
      get types() { return Object.keys(data); },
      effectAllowed: "",
      dropEffect: "",
    };
  };

  test("is not draggable without onReorder", () => {
    render(
      <EditWrapper id="comp-1" componentClicked={jest.fn()}>
        <p>Wrapped content</p>
      </EditWrapper>
    );

    expect(screen.getByRole("button")).not.toHaveAttribute("draggable", "true");
  });

  test("calls onReorder with dragged and target ids on drop", () => {
    const onReorder = jest.fn();
    render(
      <>
        <EditWrapper id="comp-1" componentClicked={jest.fn()} onReorder={onReorder}>
          <p>First</p>
        </EditWrapper>
        <EditWrapper id="comp-2" componentClicked={jest.fn()} onReorder={onReorder}>
          <p>Second</p>
        </EditWrapper>
      </>
    );
    const [first, second] = screen.getAllByRole("button");
    expect(first).toHaveAttribute("draggable", "true");

    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(first, { dataTransfer });
    fireEvent.dragOver(second, { dataTransfer, clientY: 10 });
    fireEvent.drop(second, { dataTransfer, clientY: 10 });

    expect(dataTransfer.getData(DRAG_DATA_TYPE)).toBe("comp-1");
    expect(onReorder).toHaveBeenCalledWith("comp-1", "comp-2", "after");
  });

  test("ignores a drop onto itself", () => {
    const onReorder = jest.fn();
    render(
      <EditWrapper id="comp-1" componentClicked={jest.fn()} onReorder={onReorder}>
        <p>Only</p>
      </EditWrapper>
    );
    const wrapper = screen.getByRole("button");
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(wrapper, { dataTransfer });
    fireEvent.drop(wrapper, { dataTransfer });

    expect(onReorder).not.toHaveBeenCalled();
  });
});
