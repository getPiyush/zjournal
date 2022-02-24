import { ComponentObject } from "../../../Types";
import { populateContentFromJsonArray } from "../../../utils/componentUtil";


type ArticleContainerProps = {
  containerJson: ComponentObject[];
};

export default function ArticleContainer({containerJson}: ArticleContainerProps) {
  return populateContentFromJsonArray(containerJson);
}
