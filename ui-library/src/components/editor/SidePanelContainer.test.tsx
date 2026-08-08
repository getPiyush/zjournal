import { render, screen } from "@testing-library/react";

import SidePanelContainer from "./SidePanelContainer";

describe("SidePanelContainer", () => {
  test("renders the given page content", () => {
    render(<SidePanelContainer pageContent={<div>Editor Panel</div>} />);
    expect(screen.getByText("Editor Panel")).toBeInTheDocument();
  });

  test("renders nothing when there is no page content", () => {
    const { container } = render(<SidePanelContainer pageContent={null} />);
    expect(container.querySelector("#offcanvasRight")?.textContent).toBe("");
  });
});
