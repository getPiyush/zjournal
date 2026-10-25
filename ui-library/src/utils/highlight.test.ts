import { highlightHtml } from "./highlight";

const mark = (text: string) => `<mark class="p-0">${text}</mark>`;

describe("highlightHtml", () => {
  test("marks every match, ignoring case and keeping the original text", () => {
    expect(highlightHtml("Mars and MARS", ["mars"])).toBe(`${mark("Mars")} and ${mark("MARS")}`);
  });

  test("marks several words", () => {
    expect(highlightHtml("Water on Mars", ["mars", "water"])).toBe(`${mark("Water")} on ${mark("Mars")}`);
  });

  test("prefers the longest match", () => {
    expect(highlightHtml("a marsupial", ["mars", "marsupial"])).toBe(`a ${mark("marsupial")}`);
  });

  test("leaves tags and entities alone", () => {
    expect(highlightHtml('<a href="/b">b &amp; c</a>', ["b", "amp", "a"])).toBe(
      `<a href="/b">${mark("b")} &amp; c</a>`
    );
  });

  test("treats regex characters literally", () => {
    expect(highlightHtml("C++ (and C)", ["c++", "(and"])).toBe(`${mark("C++")} ${mark("(and")} C)`);
  });

  test("returns the input when there's nothing to mark", () => {
    expect(highlightHtml("Water", [])).toBe("Water");
    expect(highlightHtml("Water", ["  "])).toBe("Water");
  });
});
