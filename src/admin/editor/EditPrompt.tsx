import { useState, useEffect } from "react";

import { ComponentObject } from "../../Types";
import ConfirmationButton from "./ConfirmationButton";
import { ListEditor } from "./ListEditor";
import { TableEditor } from "./TableEditor";

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
  onDelete,
}: EditPromptProps) {
  const [compData, setCompData] = useState(component.data);

  const [outComp, setOutComp] = useState(component);

  const onUpdateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const editComponent = { ...outComp, data: compData };
    onUpdate(editComponent);
  };

  const onDeleteClick = () => {
    const editComponent = { ...outComp, data: compData };
    onDelete(editComponent);
  };

  const dataChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // @todoo add validation
    setCompData(event.target.value);
  };

  const getDefaultComponent = () => {
    return (
      <div className="padding-lr-8">
        <textarea
          className="form-control"
          id="dataInputTextAres"
          rows={10}
          onChange={dataChanged}
        >
          {compData}
        </textarea>
      </div>
    );
  };

  const childComponentUpdated = (compData: ComponentObject) => {
    setOutComp(compData);
    setCompData(compData.data);
  };

  const getEditComponent = () => {
    if (component.componenType === "List") {
      return (
        <ListEditor listData={outComp} updateListData={childComponentUpdated} />
      );
    } else if (component.componenType === "Table") {
      return (
        <TableEditor
          tableData={outComp}
          updateTableData={childComponentUpdated}
        />
      );
    } else {
      return getDefaultComponent();
    }
  };

  return (
    <div id="editPrompt" className="alert alert-light scrollable">
      <h3>Editing {component.componenType}</h3>
      <hr />
      {getEditComponent()}
      <hr />
      <div className="editor-action-col-end">
        <button
          type="button"
          className="btn btn-secondary btn-md"
          data-bs-dismiss="offcanvas"
          onClick={onCancel}
        >
          Cancel
        </button>
        <div className="padding-lr-8">
          <button
            className="btn btn-primary btn-md btn-danger"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#deleteConfirmation"
            aria-expanded="false"
            aria-controls="deleteConfirmation"
          >
            <i className="bi bi-trash"></i>
          </button>
       { /**   <ConfirmationButton
              buttonText={null}
              confirmationClick={onDeleteClick}
              confirmationMessage="Are you sure want to delete?"
              iconComp={ <i className="bi bi-trash"></i>}
              disabled={false}
            />
            */
       }

        </div>
        <div className="padding-lr-8">
          <button
            onClick={onUpdateClick}
            type="button"
            data-bs-dismiss="offcanvas"
            className="btn btn-primary btn-md"
          >
            Update
          </button>
        </div>
      </div>
      <div className="collapse" id="deleteConfirmation">
        <div className="card card-body">
          <div className="editor-action-col-end"></div>
          <div>
            <b>Are you sure want to delete?</b>
          </div>
          <br />
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

          <hr />
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
