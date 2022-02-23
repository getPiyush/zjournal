import { useState, useEffect } from "react";

import { ComponentObject } from "../../Types";

type EditPromptProps = {
  component: ComponentObject;
  onCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onUpdate: (editComponent: ComponentObject) => void;
};

export default function EditPrompt({
  component,
  onCancel,
  onUpdate,
}: EditPromptProps) {
  const [compData, setCompData] = useState(component.data);

  useEffect(() => {
    setCompData(component.data);
  }, [component]);

  const onUpdateClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const editComponent = { ...component, data: compData };
    onUpdate(editComponent);
  };

  const dataChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // @todoo add validation
    setCompData(event.target.value);
  };
  
  return (
    <div id="editPrompt" className="card edit-prompt">
      <h5 className="card-header">Editing {component.componenType}</h5>
      <div className="card-body">
        <textarea
          className="form-control"
          id="dataInputTextAres"
          rows={3}
          onChange={dataChanged}
        >
          {compData}
        </textarea>
      </div>
      <div className="card-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          onClick={onUpdateClick}
          type="button"
          className="btn btn-primary"
        >
          Update
        </button>
      </div>
    </div>
  );
}
