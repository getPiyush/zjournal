import ReactHtmlParser from 'react-html-parser';
import { ComponentObject } from "../../Types";

type ListProps = {
  listData: ComponentObject;
};

export const List = ({ listData }: ListProps) => {
  if (typeof listData.data !== "string") {
    return (
      <div
        className="list-component"
        id={listData.componenType + "_" + listData.componentId}
        key={"key_" + listData.componentId}
      >
        {listData.numbered && (
          <ol type="1">
            {listData.data.map((item, index) => (
              <li key={`key_${index}_${item.replace(/[^A-Z0-9]/gi, "_")}`}>
                {ReactHtmlParser(item)}
              </li>
            ))}
          </ol>
        )}
        {!listData.numbered && (
          <ul>
            {listData.data.map((item, index) => (
              <li key={`key_${index}_${item.replace(/[^A-Z0-9]/gi, "_")}`}>
                {ReactHtmlParser(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  } else {
    return (
      <div
        id={listData.componenType + "_" + listData.componentId}
        key={"key_" + listData.componentId}
      >
        <ul>
          <li> {ReactHtmlParser(listData.data)}</li>
        </ul>
      </div>
    );
  }
};
