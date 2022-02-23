import { useState, useEffect } from "react";

import { ComponentObject } from "../../Types";

type EditPromptProps = {
  component: ComponentObject;
  onCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onUpdate: (editComponent: ComponentObject) => void;
  onDelete: (editComponent: ComponentObject) => void;
};

export default function EditPrompt({
  component,
  onCancel,
  onUpdate,
  onDelete
}: EditPromptProps) {
  const [compData, setCompData] = useState(component.data);

  const [setDelete, setDeleteState] = useState(false);

  const onUpdateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const editComponent = { ...component, data: compData };
    onUpdate(editComponent);
  };

  const onDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const editComponent = { ...component, data: compData };
    onDelete(editComponent);
  };
  

  const dataChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // @todoo add validation
    setCompData(event.target.value);
  };

  return (
    <div id="editPrompt" className="alert alert-light">
      <h3>Editing {component.componenType}</h3>
      <hr />
      <div className="padding-lr-8">
        <textarea
          className="form-control"
          id="dataInputTextAres"
          rows={3}
          onChange={dataChanged}
        >
          {compData}
        </textarea>
      </div>
      <hr />
      <div className="editor-action-col-end">
        <button
          type="button"
          className="btn btn-secondary btn-lg"
          data-bs-dismiss="offcanvas"
          onClick={onCancel}
        >
          Cancel
        </button>
        <div className="padding-lr-8">
          <button
            className="btn btn-primary btn-lg btn-danger"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#deleteConfirmation"
            aria-expanded="false"
            aria-controls="deleteConfirmation"
          ><i className="bi bi-trash"></i>
          </button>
        </div>
        <div className="padding-lr-8">
          <button
            onClick={onUpdateClick}
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-primary btn-lg"
          >
            Update
          </button>
        </div>
      </div>
      <div className="collapse" id="deleteConfirmation">
        <div className="card card-body">
          <div className="editor-action-col-end"></div>
          <div><b>Are you sure want to delete?</b></div>
          <br/>
          <button
            className="btn btn-primary btn-sm"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#deleteConfirmation"
            aria-expanded="false"
            aria-controls="deleteConfirmation"
          >
            No
          </button>
          
          <hr/>
          <button
            onClick={onDeleteClick}
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-primary btn-sm btn-danger"
          >
            Yes
          </button>
          
        </div>
      </div>
    </div>
  );
}
