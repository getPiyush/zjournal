import { ComponentObject } from "../../Types";

type ListProps = {
  listData: ComponentObject;
};

export const List = ({ listData }: ListProps) => {
  if (typeof listData.data !== "string") {
    return (
      <div
        id={listData.componenType + "_" + listData.componentId}
        key={"key_" + listData.componentId}
      >
        {listData.numbered && (
          <ol type="1">
            {listData.data.map((item) => (
              <li>{item}</li>
            ))}
          </ol>
        )}
        {!listData.numbered && (
          <ul>
            {listData.data.map((item) => (
              <li>{item}</li>
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
          <li>{listData.data}</li>
        </ul>
      </div>
    );
  }
};
