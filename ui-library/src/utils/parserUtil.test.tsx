import { render } from "@testing-library/react";

import { parsex } from "./parserUtil";

describe("parsex", () => {
  test("parses an HTML string into React elements", () => {
    const { container } = render(<div>{parsex("<p>Hello <b>world</b></p>")}</div>);
    expect(container.querySelector("p")).not.toBeNull();
    expect(container.querySelector("b")?.textContent).toBe("world");
  });

  test("strips elements with class=\"remove\"", () => {
    const { container } = render(
      <div>{parsex('<div><span class="remove">gone</span><span>kept</span></div>')}</div>
    );
    expect(container.textContent).toBe("kept");
  });

  test("returns an empty result for a non-string input", () => {
    const { container } = render(<div>{parsex(["not", "a", "string"])}</div>);
    expect(container.textContent).toBe("");
  });

  test("passes through plain text untouched", () => {
    const { container } = render(<div>{parsex("plain text")}</div>);
    expect(container.textContent).toBe("plain text");
  });
});
