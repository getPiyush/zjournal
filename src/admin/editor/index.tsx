import React, { useState } from "react";
import { ComponentObject } from "../../Types";

import {
  populateComponentFromCode,
  getUid,
  getComponentFromId,
  setComponentById
} from "../../utils/componentUtil";
import ArticleContainerEditor from "./ArticleContainerEditor";
import EditPrompt from "./EditPrompt";

export default function Editor() {
  const components = [
    "h2",
    "h3",
    "h4",
    "h5",
    "Image",
    "Paragraph",
    "List",
    "Table"
  ];
  const sampleText = "The quick brown fox, jumps over a lazy dog.!?";
  const [content, setContent] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState("h2");
  const [editComponent, setEditcomponent] = useState(null);

  const onElementSelect = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target: any = event.currentTarget;
    const componentCode = target.getAttribute("component-code");
    setSelectedElement(componentCode);
  };

  const onComponentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target: any = event.currentTarget;
    const componentId = target.getAttribute("id");

    const editComponent = getComponentFromId(componentId, content);

    console.log(editComponent);
    if (editComponent) {
      setEditcomponent(editComponent);
      setEditMode(true);
    }
  };

  const onPreviewClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Previewing Final Result");
  };

  const onEditCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEditMode(false);
  };
  const onEditUpdate = (editComponent) => {
    setEditcomponent(editComponent);
    setEditMode(false);
    const updatedComponent = setComponentById(
      editComponent.componentId,
      content,
      editComponent
    );
    setContent(updatedComponent);
  };

  const onAddElementClick = () => {
    const defaultHeader = "Click to Update Header";
    const defaultContent = "Click to Update Content";
    const defaultImage = "images/placeholder-image.png";
    let dynamicData = defaultHeader;
    if (selectedElement === "Image") dynamicData = defaultImage;
    if (selectedElement === "Paragraph") dynamicData = defaultContent;

    let component: ComponentObject = {
      componentId: getUid(),
      componenType: selectedElement,
      data: dynamicData
    };
    setContent([...content, component]);
  };

  return (
    <div id="editor" className="editor container">
      <div className="row">
        <div className="col">
          <h1>Article Editor</h1>
          <label htmlFor="exampleFormControlInput1" className="form-label">
            Title
          </label>
          <input
            type="email"
            className="form-control"
            id="exampleFormControlInput1"
            placeholder="This is a sample title"
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="dropdown" style={{ width: "100% !important" }}>
            <button
              className="btn btn-sm btn-outline-dark dropdown-toggle"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ width: "100% !important" }}
            >
              Selected <b>{selectedElement}</b> from the drop down
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              {components.map((componentCode) => {
                return (
                  <li>
                    <a
                      className={`dropdown-item ${
                        componentCode === selectedElement ? "active" : ""
                      }`}
                      href="#"
                      component-code={componentCode}
                      onClick={onElementSelect}
                    >
                      {populateComponentFromCode(componentCode, sampleText)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="col">
          <button
            className="btn btn-primary btn-sm"
            onClick={onAddElementClick}
          >
            <i className="bi bi-plus-circle-fill"></i>&nbsp;&nbsp;Add{" "}
            <b>{selectedElement}</b> to Article
          </button>
        </div>
        <div className="col">
          <button className="btn btn-primary btn-sm" onClick={onPreviewClick}>
            <i className="bi bi-camera-fill"></i>&nbsp;&nbsp;Preview
          </button>
        </div>
      </div>
      {editMode && (
        <div className="row">
          <div className="col">
            <EditPrompt
              onUpdate={onEditUpdate}
              onCancel={onEditCancel}
              component={editComponent}
            />
          </div>
        </div>
      )}
      <div className="row">
        <div className="col">
          <ArticleContainerEditor
            componentClicked={onComponentClick}
            containerJson={content}
          />
        </div>
      </div>
    </div>
  );
}
