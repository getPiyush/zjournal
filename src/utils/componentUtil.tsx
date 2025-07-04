import React from "react";
import { parsex } from "../utils/parserUtil";

import EditWrapper from "../admin/components/editor/EditWrapper";
import { applicationProperties } from "../ApplicationConstants";
import { ArticleT, ComponentObject } from "../Types";
import { List } from "../web/components/List";
import { Table } from "../web/components/Table";
import { decryptDataNode, decryptDataPhp, encryptDataNode, encryptDataPhp } from "./crypto";

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

export const populateComponentFromCode = (code: string, text: string) => {
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
  editable?: boolean
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
        <img
          id={obj.componenType + "_" + obj.componentId}
          key={"key_" + obj.componentId}
          src={`${obj.data}`}
          className="img-fluid"
          alt={obj.altText}
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
    />
  ) : (
    comp
  );
};

export const populateContentFromJsonArray = (
  content: ComponentObject[],
  componentClicked?: (event: React.MouseEvent<HTMLDivElement>) => void,
  editable?: boolean
) => {
  return (
    <React.Fragment>
      {content.map((component: ComponentObject) =>
        getComponentFromObject(component, componentClicked, editable)
      )}
    </React.Fragment>
  );
};

export const getDate = (date: Date | string) => {
  let dateOut = new Date(date);
  if (typeof date === "string") dateOut = new Date(date);
  return dateOut.toDateString();
};

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

export const sliceWords = (str, start, end) => {
  return str.slice(str.indexOf(" ", start), str.indexOf(" ", end));
};

export const removeHTML = (htmlStr) => {
  return htmlStr.replace(/<\/?[^>]+(>|$)/g, "");
};

export const decryptData = (data) => {
  if (applicationProperties.serverMode === "node") {
    if (applicationProperties.enableEncryption) {
      return decryptDataNode(data.zjData);
    } else {
      return data.zjData;
    }
  } else if (applicationProperties.serverMode === "php") {
    const strData = data.ezjData;
    const decryptedData = JSON.parse(decryptDataPhp(strData));
    if (decryptedData) return decryptedData;
  }

  return data;
};

export const encryptOutData = (data) => {
  if(applicationProperties.serverMode === "php"){
  return { "ezjData": encryptDataPhp(JSON.stringify(data)) };
  }
  else if(applicationProperties.serverMode === "node" && applicationProperties.enableEncryption)
  {
    return  { "ezjData": encryptDataNode(JSON.stringify(data)) };
  }
  else{
    return data;
  }
}
