import React from "react";
import { parsex } from "../utils/parserUtil";

import EditWrapper from "../components/editor/EditWrapper";
import { ArticleT, ComponentObject } from "../Types";
import { List } from "../components/List";
import { Table } from "../components/Table";
import { Cover } from "../components/Home/Cover";

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getUid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const updateWithId = (compArray: ComponentObject[]) => {
  let updatedCompArray = [];
  compArray.forEach((element) => {
    updatedCompArray.push({ ...element, componentId: getUid() });
  });
  return updatedCompArray;
};

export const getComponentFromId = (
  id: string,
  compArray: ComponentObject[]
) => {
  let resultElement: ComponentObject = null;
  compArray.forEach((element) => {
    if (id === element.componentId) {
      resultElement = element;
      return false;
    }
  });
  return resultElement;
};

export const getArticleFromId = (id: string, artArray: ArticleT[]) => {
  let resultArticle: ArticleT = null;
  artArray.forEach((article) => {
    if (id === article.id) {
      resultArticle = article;
      return false;
    }
  });
  return resultArticle;
};

export const setComponentById = (
  id: string,
  compArray: ComponentObject[],
  component: ComponentObject
) => {
  let resultArray: ComponentObject[] = [...compArray];
  compArray.forEach((element, index) => {
    if (id === element.componentId) {
      resultArray[index] = component;
      return false;
    }
  });
  return resultArray;
};

export const deleteComponent = (id: string, compArray: ComponentObject[]) => {
  let resultArray: ComponentObject[] = [];
  compArray.forEach((element) => {
    if (id !== element.componentId) {
      resultArray.push(element);
    }
  });
  return resultArray;
};

export type DropPosition = "before" | "after";

export type ComponentReorderHandler = (
  draggedId: string,
  targetId: string,
  position: DropPosition
) => void;

export const moveComponent = (
  draggedId: string,
  targetId: string,
  compArray: ComponentObject[],
  position: DropPosition = "before"
) => {
  const fromIndex = compArray.findIndex((c) => c.componentId === draggedId);
  if (fromIndex === -1 || draggedId === targetId) return compArray;

  const resultArray = [...compArray];
  const [dragged] = resultArray.splice(fromIndex, 1);
  const targetIndex = resultArray.findIndex((c) => c.componentId === targetId);
  if (targetIndex === -1) return compArray;

  resultArray.splice(
    position === "after" ? targetIndex + 1 : targetIndex,
    0,
    dragged
  );
  return resultArray;
};

export const populateComponentFromCode =(code: string, text: string) => {
  let comp: any;
  switch (code.toUpperCase()) {
    case "H1":
      comp = <h1 data-testid="output-element">{text}</h1>;
      break;
    case "H2":
      comp = <h2 data-testid="output-element">{text}</h2>;
      break;
    case "H3":
      comp = <h3 data-testid="output-element">{text}</h3>;
      break;
    case "H4":
      comp = <h4 data-testid="output-element">{text}</h4>;
      break;
    case "H5":
      comp = <h5 data-testid="output-element">{text}</h5>;
      break;
    case "IMAGE":
      comp = (
        <div data-testid="output-element">
          Image <i className="bi bi-file-image"></i>
        </div>
      );
      break;
    case "PARAGRAPH":
      comp = (
        <div data-testid="output-element">
          Paragraph <i className="bi bi-paragraph"></i>
        </div>
      );
      break;

    case "LIST":
      comp = (
        <div data-testid="output-element">
          List <i className="bi bi-card-list"></i>
        </div>
      );
      break;

    default:
      comp = <span data-testid="output-element">{code}</span>;
      break;
  }
  return comp;
};

const getComponentFromObject = (
  obj: ComponentObject,
  componentClicked?: (event: React.MouseEvent<HTMLDivElement>) => void,
  editable?: boolean,
  onReorder?: ComponentReorderHandler,
  category?: string
) => {
  let comp: any;
  switch (obj.componenType.toUpperCase()) {
    case "H1":
      comp = (
        <h1
          id={obj.componenType + "_" + obj.componentId}
          key={"key_" + obj.componentId}
        >
          {parsex(obj.data)}
        </h1>
      );
      break;
    case "H2":
      comp = (
        <h2
          id={obj.componenType + "_" + obj.componentId}
          key={"key_" + obj.componentId}
        >
          {parsex(obj.data)}
        </h2>
      );
      break;
    case "H3":
      comp = (
        <h3
          id={obj.componenType + "_" + obj.componentId}
          key={"key_" + obj.componentId}
        >
          {parsex(obj.data)}
        </h3>
      );
      break;
    case "H4":
      comp = (
        <h4
          id={obj.componenType + "_" + obj.componentId}
          key={"key_" + obj.componentId}
        >
          {parsex(obj.data)}
        </h4>
      );
      break;

    case "H5":
      comp = (
        <h5
          id={obj.componenType + "_" + obj.componentId}
          key={"key_" + obj.componentId}
        >
          {parsex(obj.data)}
        </h5>
      );
      break;

    case "IMAGE":
      comp = (
        // Keeps the image's own shape; a broken one becomes the category placeholder.
        <Cover
          id={obj.componenType + "_" + obj.componentId}
          key={"key_" + obj.componentId}
          image={typeof obj.data === "string" ? obj.data : obj.data[0] || ""}
          category={category}
          className="img-fluid"
          alt={obj.altText}
          imageAs="img"
        />
      );
      break;
    case "PARAGRAPH":
      comp = (
        <p
          id={obj.componenType + "_" + obj.componentId}
          key={"key_" + obj.componentId}
        >
          {parsex(obj.data)}
        </p>
      );
      break;

    case "LIST":
      comp = <List key={"key_" + obj.componentId} listData={obj} />;
      break;

    case "TABLE":
      comp = <Table key={"key_" + obj.componentId} tableData={obj} />;
      break;

    default:
      comp = (
        <span key={"key_" + obj.componentId}>{parsex(obj.data)}</span>
      );
      break;
  }
  return editable ? (
    <EditWrapper
      componentClicked={componentClicked}
      children={comp}
      id={obj.componentId}
      key={"key_" + obj.componentId}
      onReorder={onReorder}
    />
  ) : (
    comp
  );
};

// `category` tints the placeholder that stands in for a broken image.
export const populateContentFromJsonArray = (
  content: ComponentObject[],
  componentClicked?: (event: React.MouseEvent<HTMLDivElement>) => void,
  editable?: boolean,
  onReorder?: ComponentReorderHandler,
  category?: string
) => {
  return (
    <React.Fragment>
      {content.map((component: ComponentObject) =>
        getComponentFromObject(component, componentClicked, editable, onReorder, category)
      )}
    </React.Fragment>
  );
};

// e.g. "Aug 27, 2026", in the reader's own locale.
export const getDate = (date: Date | string) =>
  new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export const getMonths = (from: string, to: string) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  const fromYear = fromDate.getFullYear();
  const fromMonth = fromDate.getMonth();
  const toYear = toDate.getFullYear();
  const toMonth = toDate.getMonth();

  const months = [];

  for (let year = fromYear; year <= toYear; year++) {
    let month = year === fromYear ? fromMonth : 0;
    const monthLimit = year === toYear ? toMonth : 11;
    for (; month <= monthLimit; month++) {
      months.push({ year, month });
    }
  }
  return months;
};

// Slices at word boundaries: from the start of the string (start 0) or the first space at/after
// `start`, up to the first space at/after `end`, or the end of the string when there is none.
export const sliceWords = (str, start, end) => {
  const from = start === 0 ? 0 : str.indexOf(" ", start);
  const to = str.indexOf(" ", end);
  return str.slice(from === -1 ? str.length : from, to === -1 ? str.length : to);
};

export const removeHTML = (htmlStr) => {
  return htmlStr.replace(/<\/?[^>]+(>|$)/g, "");
};
