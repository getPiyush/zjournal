import React, { useEffect, useState } from "react";

import { ComponentObject } from "../../../Types";
import { Table } from "../../../web/components/Table";

type ListProps = {
  tableData: ComponentObject;
  updateTableData: (data: ComponentObject) => void;
};

export const TableEditor = ({ tableData, updateTableData }: ListProps) => {
  const [tData, setTData] = useState(tableData.data);
  const [numbered, setNumbered] = useState(tableData.numbered);

  useEffect(() => {
    updateComponent();
  }, [tData, numbered]);

  const updateComponent = () => {
    const updatedComponent = { ...tableData, data: tData, numbered: numbered };
    updateTableData(updatedComponent);
  };

  const checkSelected = () => {
    setNumbered(!numbered);
  };

  const textChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const itemValue = event.target.value;
    if (itemValue.split(/\r/g).length > 0) {
      setTData(itemValue);
    }
  };

  const tdata = `|hefwiofhweyof|klfjlkfjsdlkjsdkl|
|kdsfhksdjfhsdjk|kdlsfjskldjskl|
|kjdfhsjkdhskjd|kldsjclkdsfjslk|`;

  return (
    <React.Fragment>
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
          Header (first row)?
        </label>
      </div>
      <hr />
      <div className="padding-lr-8">
        <textarea
          className="form-control"
          id="dataInputTextAres"
          rows={10}
          onChange={textChanged}
        >
          {tData}
        </textarea>
      </div>
      <hr />
      <div style={{ zoom: ".7" }}>
        <Table tableData={{ ...tableData, data: tData, numbered: numbered }} />
      </div>
    </React.Fragment>
  );
};
