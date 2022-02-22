import { render, screen } from "@testing-library/react";
import * as componentUtil from "./componentUtil";

describe("Test Component Util", () => {
  test("populateComponentFromCode : renders Header component", () => {
    render(componentUtil.populateComponentFromCode("h1", "Test Inner text"));
    expect(screen.getByRole("heading").innerHTML).toContain("Test Inner text");
  });

  test("populateComponentFromCode : renders non Header component", () => {
    render(
      componentUtil.populateComponentFromCode("paragraph", "Test Inner text")
    );
    expect(screen.getByTestId("output-element").innerHTML).toContain(
      "paragraph"
    );
  });

  test("populateContentFromJsonArray : renders Header component", () => {
    const jsonInput = [
      {
        componenType: "Paragraph",
        data: "Test Data 1",
      },
      {
        componenType: "h2",
        data: "Test Data 1",
      },
      {
        componenType: "Image",
        data: "http://test.url/IMAGE_URL",
        altText:'None'
      },
    ];
    render(componentUtil.populateContentFromJsonArray(jsonInput));
    expect(screen.getByRole("heading").innerHTML).toContain("Test Data 1");
    expect(screen.getByRole("img")).toHaveProperty(
      "src",
      "http://test.url/IMAGE_URL"
    );
  });
});
