import { screen, render } from "@testing-library/react";

import {
  getUid,
  updateWithId,
  getComponentFromId,
  getArticleFromId,
  setComponentById,
  deleteComponent,
  populateComponentFromCode,
  populateContentFromJsonArray,
  getDate,
  getMonths,
  sliceWords,
  removeHTML,
} from "./componentUtil";
import { ArticleT, ComponentObject } from "../Types";

describe("getUid", () => {
  test("returns a non-empty string", () => {
    expect(typeof getUid()).toBe("string");
    expect(getUid().length).toBeGreaterThan(0);
  });

  test("returns a different value on each call", () => {
    expect(getUid()).not.toEqual(getUid());
  });
});

describe("updateWithId", () => {
  test("assigns a componentId to every element without mutating the input array", () => {
    const input: ComponentObject[] = [
      { componenType: "H1", data: "one" },
      { componenType: "PARAGRAPH", data: "two" },
    ];

    const result = updateWithId(input);

    expect(result).toHaveLength(2);
    result.forEach((component) => {
      expect(typeof component.componentId).toBe("string");
      expect(component.componentId.length).toBeGreaterThan(0);
    });
    expect(input[0]).not.toHaveProperty("componentId");
  });

  test("returns an empty array for an empty input", () => {
    expect(updateWithId([])).toEqual([]);
  });
});

describe("getComponentFromId", () => {
  const components: ComponentObject[] = [
    { componentId: "a", componenType: "H1", data: "one" },
    { componentId: "b", componenType: "H2", data: "two" },
  ];

  test("returns the matching component", () => {
    expect(getComponentFromId("b", components)).toEqual(components[1]);
  });

  test("returns null when no component matches", () => {
    expect(getComponentFromId("missing", components)).toBeNull();
  });
});

describe("getArticleFromId", () => {
  const articles = [{ id: "1" }, { id: "2" }] as ArticleT[];

  test("returns the matching article", () => {
    expect(getArticleFromId("2", articles)).toEqual(articles[1]);
  });

  test("returns null when no article matches", () => {
    expect(getArticleFromId("missing", articles)).toBeNull();
  });
});

describe("setComponentById", () => {
  const components: ComponentObject[] = [
    { componentId: "a", componenType: "H1", data: "one" },
    { componentId: "b", componenType: "H2", data: "two" },
  ];

  test("replaces the component with the matching id", () => {
    const replacement: ComponentObject = {
      componentId: "b",
      componenType: "H3",
      data: "replaced",
    };

    const result = setComponentById("b", components, replacement);

    expect(result[1]).toEqual(replacement);
    expect(result[0]).toEqual(components[0]);
  });

  test("does not mutate the original array", () => {
    const replacement: ComponentObject = {
      componentId: "b",
      componenType: "H3",
      data: "replaced",
    };
    setComponentById("b", components, replacement);
    expect(components[1].data).toBe("two");
  });

  test("returns an unchanged copy when the id is not found", () => {
    const replacement: ComponentObject = {
      componentId: "missing",
      componenType: "H3",
      data: "replaced",
    };
    expect(setComponentById("missing", components, replacement)).toEqual(
      components
    );
  });
});

describe("deleteComponent", () => {
  const components: ComponentObject[] = [
    { componentId: "a", componenType: "H1", data: "one" },
    { componentId: "b", componenType: "H2", data: "two" },
  ];

  test("removes the component with the matching id", () => {
    expect(deleteComponent("a", components)).toEqual([components[1]]);
  });

  test("returns an equivalent array when the id is not found", () => {
    expect(deleteComponent("missing", components)).toEqual(components);
  });
});

describe("populateComponentFromCode", () => {
  test("renders a heading for H1", () => {
    render(populateComponentFromCode("h1", "Test Inner text"));
    expect(screen.getByRole("heading").innerHTML).toContain(
      "Test Inner text"
    );
  });

  test("is case-insensitive", () => {
    render(populateComponentFromCode("H2", "Upper case code"));
    expect(screen.getByRole("heading").innerHTML).toContain(
      "Upper case code"
    );
  });

  test("renders a placeholder for a non-heading code", () => {
    render(populateComponentFromCode("paragraph", "Test Inner text"));
    expect(screen.getByTestId("output-element").innerHTML).toContain(
      "paragraph"
    );
  });

  test("falls back to the raw code for an unknown type", () => {
    render(populateComponentFromCode("unknown-code", "irrelevant"));
    expect(screen.getByTestId("output-element").innerHTML).toContain(
      "unknown-code"
    );
  });
});

describe("populateContentFromJsonArray", () => {
  test("renders headings and images from a component array", () => {
    const jsonInput: ComponentObject[] = [
      { componentId: "comp-1", componenType: "Paragraph", data: "Test Data 1" },
      { componentId: "comp-2", componenType: "h2", data: "Test Data 1" },
      {
        componentId: "comp-3",
        componenType: "Image",
        data: "http://test.url/IMAGE_URL",
        altText: "None",
      },
    ];

    render(populateContentFromJsonArray(jsonInput));

    expect(screen.getByRole("heading").innerHTML).toContain("Test Data 1");
    expect(screen.getByRole("img")).toHaveProperty(
      "src",
      "http://test.url/IMAGE_URL"
    );
  });

  test("wraps components in an EditWrapper when editable", () => {
    const jsonInput: ComponentObject[] = [
      { componentId: "comp-1", componenType: "h1", data: "Editable title" },
    ];
    const componentClicked = jest.fn();

    render(
      populateContentFromJsonArray(jsonInput, componentClicked, true)
    );

    const wrapper = screen.getByRole("button");
    expect(wrapper.id).toBe("comp-1");
  });
});

describe("getDate", () => {
  test("formats a Date object as a date string", () => {
    const date = new Date(2024, 0, 15);
    expect(getDate(date)).toBe(date.toDateString());
  });

  test("formats a date string as a date string", () => {
    expect(getDate("2024-01-15T00:00:00")).toBe(
      new Date("2024-01-15T00:00:00").toDateString()
    );
  });
});

describe("getMonths", () => {
  // Date-only strings (e.g. "2024-01-15") are parsed as UTC by `Date`, which can
  // shift the local date (and month) depending on the runner's timezone. Using an
  // explicit local time component keeps these tests timezone-independent.
  test("returns every year/month pair within a single year", () => {
    expect(getMonths("2024-01-15T00:00:00", "2024-03-01T00:00:00")).toEqual([
      { year: 2024, month: 0 },
      { year: 2024, month: 1 },
      { year: 2024, month: 2 },
    ]);
  });

  test("spans across a year boundary", () => {
    expect(getMonths("2023-11-01T00:00:00", "2024-01-01T00:00:00")).toEqual([
      { year: 2023, month: 10 },
      { year: 2023, month: 11 },
      { year: 2024, month: 0 },
    ]);
  });

  test("returns a single entry when from and to are in the same month", () => {
    expect(getMonths("2024-05-01T00:00:00", "2024-05-20T00:00:00")).toEqual([
      { year: 2024, month: 4 },
    ]);
  });
});

describe("sliceWords", () => {
  test("slices the string between the word boundaries at start and end", () => {
    const str = "The quick brown fox jumps";
    expect(sliceWords(str, 0, 10)).toBe(" quick brown");
  });
});

describe("removeHTML", () => {
  test("strips HTML tags from a string", () => {
    expect(removeHTML("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  test("returns plain text unchanged", () => {
    expect(removeHTML("plain text")).toBe("plain text");
  });
});
