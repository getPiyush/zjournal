import ReactHtmlParser from 'react-html-parser';
import { ComponentObject } from "../../Types";
import { getUid } from "../../utils/componentUtil";

type TableProps = {
  tableData: ComponentObject;
};

export const Table = ({ tableData }: TableProps) => {
  const rowData =
    typeof tableData.data === "string" ? tableData.data.split("\n") : [];
  return (
    <div id={`table_${getUid()}`}>
      <table className="table">
        {rowData.map((row, index) => {
          const columnData = row.split("|");
          if(tableData.numbered && index===0){
          return (
            <thead>
            <tr>
              {columnData.map((item) => (
                <th scope="col">{ReactHtmlParser(item)}</th>
              ))}
            </tr>
            </thead>
          );
              }
              else{
                return (
                    <tr>
                      {columnData.map((item) => (
                        <td>{ReactHtmlParser(item)}</td>
                      ))}
                    </tr>
                  );
              }
        })}
      </table>
    </div>
  );
};
