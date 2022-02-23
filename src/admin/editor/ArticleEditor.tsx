import React, { useState } from "react";
import { ArticleT, ComponentObject } from "../../Types";

import {
  populateComponentFromCode,
  getUid,
  getComponentFromId,
  setComponentById,
} from "../../utils/componentUtil";

import ArticleContainerEditor from "./ArticleContainerEditor";
import EditPrompt from "./EditPrompt";

type ArticleEditorProps = {
  articleIn: ArticleT;
  setPreview: (article: ArticleT) => void;
};

export default function ArticleEditor({
  articleIn,
  setPreview,
}: ArticleEditorProps) {
  const components = [
    "h2",
    "h3",
    "h4",
    "h5",
    "Image",
    "Paragraph",
    "List",
    "Table",
  ];
  const sampleText = "The quick brown fox, jumps over a lazy dog.!?";
  const categories = [
    "Production",
    "Quality Assurance",
    "Engineering",
    "Validation and Qualification",
    "Microbiology",
    "Good Manufacturing Practices (GMP)",
    "Quality Control",
  ];
  const [article, setArticle] = useState(articleIn);

  const [content, setContent] = useState(articleIn.content);
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState("h2");
  const [editComponent, setEditcomponent] = useState(null);

  const onElementSelect = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target: any = event.currentTarget;
    const componentCode = target.getAttribute('component-code');
    setSelectedElement(componentCode);
  };

  const onCategorySelect = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target: any = event.currentTarget;
    const category = target.innerText;
    setArticle({ ...article, categryId: category });
  };

  const onComponentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target: any = event.currentTarget;
    const componentId = target.getAttribute("id");

    const newEditComponent = getComponentFromId(componentId, content);

    if (newEditComponent && !editMode) {
      setEditcomponent(newEditComponent);
      setEditMode(true);
    }
  };

  const onPreviewClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const finalarticle = { ...article, content: content };
    setArticle(finalarticle);
    setPreview(finalarticle);
  };

  const onEditCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEditMode(false);
  };
  const onEditUpdate = (editComponent) => {
    setEditcomponent(editComponent);
    setEditMode(false);
    const updatedComponents = setComponentById(
      editComponent.componentId,
      content,
      editComponent
    );
    setContent(updatedComponents);
    setArticle({ ...article, content: updatedComponents });
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
      data: dynamicData,
    };
    setContent([...content, component]);
    setArticle({ ...article, content: content });
  };

  const titleChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    // @todoo add validation
    const titleValue = event.target.value;
    if (titleValue.split(/\r/g).length > 0) {
      setArticle({ ...article, title: titleValue });
    }
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
            value={article.title}
            onChange={titleChanged}
          />
        </div>
      </div>
      <div className="row">
        <div className="col editor-action-col-start">
          <div className="dropdown" style={{ width: "100% !important" }}>
            <button
              className="btn btn-sm btn-outline-dark dropdown-toggle"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ width: "100% !important" }}
            >
              Select component <b>{selectedElement}</b> for Article
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              {components.map((componentCode) => {
                console.log(componentCode, selectedElement);
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
          <button
            className="btn btn-primary btn-sm"
            onClick={onAddElementClick}
          >
            <i className="bi bi-plus-circle-fill"></i>&nbsp;&nbsp;Add
          </button>
        </div>
        <div className="col editor-action-col-end">
          <div className="dropdown padding-lr-8">
            <button
              className="btn btn-sm btn-outline-dark dropdown-toggle"
              type="button"
              id="categoryDropDown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {article.categryId}
            </button>
            <ul className="dropdown-menu" aria-labelledby="categoryDropDown">
              {categories.map((category) => (
                <li>
                  <a
                    className={`dropdown-item ${
                      category === article.categryId ? "active" : ""
                    }`}
                    href="#"
                    onClick={onCategorySelect}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={onPreviewClick}
            disabled={article.title === "" || article.content.length === 0}
          >
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
        <div className="col edit-area">
          <ArticleContainerEditor
            componentClicked={onComponentClick}
            containerJson={content}
          />
        </div>
      </div>
    </div>
  );
}
