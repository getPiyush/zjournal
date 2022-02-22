import React from "react";
import { ComponentObject } from "../Types";

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

    default:
      comp = <span data-testid="output-element">{code}</span>;
      break;
  }
  return comp;
};

const getComponentFromObject = (obj: ComponentObject) => {
  let comp: any;
  switch (obj.componenType.toUpperCase()) {
    case "H1":
      comp = <h1>{obj.data}</h1>;
      break;
    case "H2":
      comp = <h2>{obj.data}</h2>;
      break;
    case "H3":
      comp = <h3>{obj.data}</h3>;
      break;
    case "H4":
      comp = <h4>{obj.data}</h4>;
      break;
    case "IMAGE":
      comp = (
        <img src={`${obj.data}`} className="img-fluid" alt={obj.altText} />
      );
      break;
    case "PARAGRAPH":
      comp = <p>{obj.data}</p>;
      break;

    default:
      comp = <pre>{obj.data}</pre>;
      break;
  }
  return comp;
};

export const populateContentFromJsonArray = (content: ComponentObject[]) => {
  return (
    <React.Fragment>
      {content.map((component) => getComponentFromObject(component))}
    </React.Fragment>
  );
};
