import React, { useEffect, useState } from "react";

import { ComponentObject } from "../../../Types";

type ListProps = {
  listData: ComponentObject;
  updateListData: (data: ComponentObject) => void;
};

export const ListEditor = ({ listData, updateListData }: ListProps) => {
  let listProp = [];
  if (typeof listData.data !== "string") {
    listProp = listData.data;
  } else {
    listProp = [listData.data];           
  }

  const [list, setList] = useState(listProp);
  const [numbered, setNumbered] = useState(listData.numbered);

  useEffect(() => {
    updateComponent();
  }, [list, numbered]);

  const updateComponent = () => {
    const updatedComponent = { ...listData, data: list, numbered: numbered };
    updateListData(updatedComponent);
  };

  const checkSelected = () => {
    setNumbered(!numbered);
  };

  const textChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const itemValue = event.target.value;
    const itemIndex = Number(event.target.id.split("_")[0]);

    if (itemValue.split(/\r/g).length > 0) {
      let newList = [...list];
      newList[itemIndex] = itemValue;
      setList(newList);
    }
  };

  const onDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const itemIndex = Number(event.currentTarget.id.split("_")[0]);
    let newList = [...list];
    newList.splice(itemIndex, 1);
    setList(newList);
  };

  const onAddClick = () => {
    let newList = [...list];
    newList.push("");
    setList(newList);
  };

  const getEditItem = (index, text) => {
    return (
      <div className="list-editor_item">
        <input
          className="form-control"
          id={index + "_exampleFormControlInput1"}
          value={text}
          onChange={textChanged}
        />
        {index !== list.length - 1 && (
          <button
            id={index + "_deleteButton"}
            onClick={onDeleteClick}
            type="button"
            className="btn btn-primary btn-sm btn-danger"
          >
            <i className="bi bi-trash"></i>
          </button>
        )}
        {index === list.length - 1 && (
          <button
            id={"addButton"}
            onClick={onAddClick}
            type="button"
            className="btn btn-primary btn-sm"
          >
            <i className="bi bi-plus-circle-fill" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className="list-editor container"
      id={listData.componenType + "_" + listData.componentId}
      key={"key_" + listData.componentId}
    >
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckDefault"
          checked={numbered}
          onChange={checkSelected}
        />
        <label className="form-check-label" htmlFor="flexCheckDefault">
          Numbered Checkbox?
        </label>
      </div>
      <div>
        {numbered && (
          <ol type="1">
            {/**  */}
            {list.map((item, index) => (
              <li>
                {getEditItem(index, item)}
              </li>
            ))}
          </ol>
        )}
        {!numbered && (
          <ul>
            {/**  key={`key_${index}_${item.replace(/[^A-Z0-9]/gi, "_")}`} */}
            {list.map((item, index) => (
              <li>
                {getEditItem(index, item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
