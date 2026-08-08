import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EditWrapper from "./EditWrapper";

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
});
