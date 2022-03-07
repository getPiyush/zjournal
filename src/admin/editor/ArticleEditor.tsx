import React, { useState } from "react";
import { useJournal } from "../../datastore/contexts/JournalContext";
import { ArticleT, ComponentObject } from "../../Types";

import {
  populateComponentFromCode,
  getUid,
  getComponentFromId,
  setComponentById,
  deleteComponent,
} from "../../utils/componentUtil";

import ArticleContainerEditor from "./ArticleContainerEditor";
import EditPrompt from "./EditPrompt";
import SaveButton from "./SaveButton";
import SidePanelContainer from "./SidePanelContainer";

type ArticleEditorProps = {
  articleIn: ArticleT;
  setPreview: (article: ArticleT) => void;
};

export default function ArticleEditor({
  articleIn,
  setPreview,
}: ArticleEditorProps) {
  const sampleText = "The quick brown fox, jumps over a lazy dog.!?";

  const { state: jState } = useJournal();

  const [article, setArticle] = useState(articleIn);
  const [content, setContent] = useState(articleIn.content);
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState("h2");
  const [editComponent, setEditcomponent] = useState(null);

  const onElementDropdownSelect = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    const target: any = event.currentTarget;
    const componentCode = target.getAttribute("component-code");
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

    setEditcomponent(newEditComponent);
    setEditMode(true);
    showHdeOffCanvas(true);
  };

  const onPreviewClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const finalarticle = { ...article, content: content };
    setArticle(finalarticle);
    setPreview(finalarticle);
  };

  const onEditCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEditMode(false);
    showHdeOffCanvas(false);
  };

  const onEditUpdate = (editComponent) => {
    console.log(editComponent);
    setEditcomponent(editComponent);
    setEditMode(false);
    const updatedComponents = setComponentById(
      editComponent.componentId,
      content,
      editComponent
    );
    setContent(updatedComponents);
    setArticle({ ...article, content: updatedComponents });
    showHdeOffCanvas(false);
  };

  const onDelete = (editComponent) => {
    setEditMode(false);
    const updatedComponents = deleteComponent(
      editComponent.componentId,
      content
    );
    setContent(updatedComponents);
    setArticle({ ...article, content: updatedComponents });
    showHdeOffCanvas(false);
  };

  const onAddElementClick = () => {
    const defaultHeader = "Click to Update Text";
    const defaultContent = "Click to Update Content";
    const defaultImage = "/images/placeholder-image.png";
    let dynamicData = defaultHeader;
    if (selectedElement === "Image") dynamicData = defaultImage;
    if (selectedElement === "Paragraph") dynamicData = defaultContent;

    let component: ComponentObject = {
      componentId: getUid(),
      componenType: selectedElement,
      data: dynamicData,
      numbered: false,
    };
    setContent([...content, component]);
    setArticle({ ...article, content: content });
  };

  const titleChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const titleValue = event.target.value;
    if (titleValue.split(/\r/g).length > 0) {
      setArticle({ ...article, title: titleValue });
    }
  };

  const publishStatusUpdated = () =>{
    setArticle({ ...article, published: !article.published });
  }

  const showHdeOffCanvas = (flag) => {
    const myOffcanvas = document.getElementById("offcanvasRight");
    const bsOffcanvas = new globalThis.bootstrap.Offcanvas(myOffcanvas);
    if (flag) {
      bsOffcanvas.show();
    } else {
      bsOffcanvas.hide();
    }
    myOffcanvas.addEventListener("hidden.bs.offcanvas", function () {
      setEditMode(false);
    });
  };

  return (
    <React.Fragment>
      <div className="row">
        <div className="col">
          <div className="top-action-box">
            <SaveButton article={article} />
            <button
              className="btn btn-primary btn-sm"
              onClick={onPreviewClick}
              disabled={article.title === "" || article.content.length === 0}
            >
              <i className="bi bi-camera-fill"></i>&nbsp;&nbsp;Preview
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <label htmlFor="exampleFormControlInput1" className="form-label">
            Title
          </label>
          <input
            type="email"
            className="form-control article-title-input"
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
              {jState.journal?.components?.map((componentCode, index) => {
                return (
                  <li
                    key={`key_${index}_${componentCode.replace(
                      /[^A-Z0-9]/gi,
                      "_"
                    )}`}
                  >
                    <a
                      className={`dropdown-item ${
                        componentCode === selectedElement ? "active" : ""
                      }`}
                      href="#"
                      component-code={componentCode}
                      onClick={onElementDropdownSelect}
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
              {jState.journal?.categories?.map((category, index) => (
                <li
                  key={`key_${index}_${category.replace(/[^A-Z0-9]/gi, "_")}`}
                >
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
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="publichedCheckSwitch"
              checked={article.published}
              onChange={publishStatusUpdated}
            />
            <label className="form-check-label" htmlFor="publichedCheckSwitch">
              Published
            </label>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col edit-area">
          <ArticleContainerEditor
            componentClicked={onComponentClick}
            containerJson={content}
          />
        </div>
      </div>

      <SidePanelContainer
        pageContent={
          editMode && (
            <EditPrompt
              onUpdate={onEditUpdate}
              onCancel={onEditCancel}
              onDelete={onDelete}
              component={editComponent}
            />
          )
        }
      />
    </React.Fragment>
  );
}
