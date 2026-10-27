import { ComponentObject } from "../../Types";
import { populateContentFromJsonArray } from "../../utils/componentUtil";


type ArticleContainerProps = {
  containerJson: ComponentObject[];
  // The article's category, for the placeholder shown in place of a broken image.
  category?: string;
};

export default function ArticleContainer({ containerJson, category }: ArticleContainerProps) {
  return populateContentFromJsonArray(containerJson, undefined, false, undefined, category);
}
