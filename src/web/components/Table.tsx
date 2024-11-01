import { parsex } from "../../utils/parserUtil";
import { ComponentObject } from "../../Types";
import { getUid } from "../../utils/componentUtil";

type TableProps = {
  tableData: ComponentObject;
};

export const Table = ({ tableData }: TableProps) => {
  const rowData =
    typeof tableData.data === "string" ? tableData.data.split("\n") : [];
  return (
    <div
      key={"table_div_key_" + tableData.componentId}
      id={`table_${getUid()}`}
    >
      <table className="table" key={"table_comp_key0_" + tableData.componentId}>
        {tableData.numbered && (
          <thead>
            <tr key={"table_thead_tr_key0_" + tableData.componentId}>
              {rowData[0].split("|").map((item, indexTh) => (
                <th
                  key={
                    "table_comp_key_" + indexTh + "_" + tableData.componentId
                  }
                  scope="col"
                >
                  {parsex(item)}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rowData.map((row, index) => {
            const columnData = row.split("|");
            if (tableData.numbered && index === 0) {
            } else {
              return (
                <tr key={"table_tr_key_" + index + "_" + tableData.componentId}>
                  {columnData.map((item, tdIndex) => (
                    <td
                      key={
                        "table_td_key_" +
                        index +
                        "_" +
                        tdIndex +
                        "_" +
                        tableData.componentId
                      }
                    >
                      {parsex(item)}
                    </td>
                  ))}
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};
