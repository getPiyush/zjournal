import { useState } from "react";

import { ComponentObject } from "../../Types";

type EditPromptProps = {
  component: ComponentObject;
  onCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onUpdate: (editComponent:ComponentObject) => void;

};

export default function EditPrompt({ component, onCancel, onUpdate }: EditPromptProps) {
  const [compData, setCompData] = useState('');
const onUpdateClick = (event :React.MouseEvent<HTMLButtonElement>) =>{
  const editComponent = {...component, data:compData}
  onUpdate(editComponent);
}

const dataChanged = (event :React.ChangeEvent<HTMLTextAreaElement>) =>{
  // @todoo add validation
  setCompData(event.target.value);
}
  return (
    <div id="editPrompt">
      <div className="modal-body">
        <div>Editing {component.componenType}</div>
        <div className="mb-3">
          <label htmlFor="dataInputTextAres" className="form-label">
            Edit {component.componenType}
          </label>
          <textarea className="form-control" id="dataInputTextAres" rows={3} onChange={dataChanged}>
            {component.data}
          </textarea>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button onClick={onUpdateClick} type="button" className="btn btn-primary">
          Update
        </button>
      </div>
    </div>
  );
}
