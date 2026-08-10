import { render, screen } from "@testing-library/react";

import AboutUs from "./AboutUs";
import { AllProviders } from "../testUtils/renderWithProviders";

describe("AboutUs", () => {
  test("renders nothing extra when there is no about-us content", () => {
    const { container } = render(
      <AllProviders>
        <AboutUs />
      </AllProviders>
    );
    expect(container.querySelector(".about-us")).not.toBeNull();
  });

  test("sets the document title", () => {
    render(
      <AllProviders>
        <AboutUs />
      </AllProviders>
    );
    expect(document.title).toContain("About");
  });
});
