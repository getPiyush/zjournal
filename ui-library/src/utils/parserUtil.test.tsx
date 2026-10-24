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

  // Content reaching parsex includes text scraped from other sites (article-generator) and
  // anything typed into the admin, so script-capable markup must not survive.
  describe("sanitizing", () => {
    test("drops iframes, including srcdoc ones that would run script as this origin", () => {
      const { container } = render(
        <div>{parsex('<p>hi</p><iframe srcdoc="<script>alert(1)</script>"></iframe>')}</div>
      );
      expect(container.querySelector("iframe")).toBeNull();
      expect(container.textContent).toBe("hi");
    });

    test("drops script, object and embed elements", () => {
      const { container } = render(
        <div>{parsex('<script>alert(1)</script><object data="x"></object><embed src="x">ok')}</div>
      );
      expect(container.querySelector("script, object, embed")).toBeNull();
      expect(container.textContent).toBe("ok");
    });

    test("removes javascript: links but keeps the link text", () => {
      const { container } = render(<div>{parsex('<a href="javascript:alert(1)">click</a>')}</div>);
      expect(container.querySelector("a")?.getAttribute("href")).toBeNull();
      expect(container.textContent).toBe("click");
    });

    test("removes inline event handlers", () => {
      const { container } = render(<div>{parsex('<img src="x.png" onerror="alert(1)">')}</div>);
      expect(container.querySelector("img")?.getAttribute("onerror")).toBeNull();
    });

    test("keeps the markup stored articles use", () => {
      const { container } = render(
        <div>
          {parsex('<h3>T</h3><div><q>quote</q><br/><a target="_blank" href="https://example.com/a">link</a></div>')}
        </div>
      );
      const link = container.querySelector("a");
      expect(container.querySelector("h3")?.textContent).toBe("T");
      expect(container.querySelector("q")?.textContent).toBe("quote");
      expect(container.querySelector("br")).not.toBeNull();
      expect(link?.getAttribute("href")).toBe("https://example.com/a");
      expect(link?.getAttribute("target")).toBe("_blank");
    });

    test("adds rel=noopener to links that open a new tab", () => {
      const { container } = render(<div>{parsex('<a target="_blank" href="https://example.com">x</a>')}</div>);
      expect(container.querySelector("a")?.getAttribute("rel")).toBe("noopener noreferrer");
    });

    test("still applies the class=\"remove\" rule after sanitizing", () => {
      const { container } = render(<div>{parsex('<span class="remove">gone</span>kept')}</div>);
      expect(container.textContent).toBe("kept");
    });

    test("renders escaped angle brackets as text", () => {
      const { container } = render(<div>{parsex("CSS for the &lt;Component&gt; Age")}</div>);
      expect(container.textContent).toBe("CSS for the <Component> Age");
    });
  });
});
