import { ComponentObject } from "../../Types";
import { populateContentFromJsonArray } from "../../utils/componentUtil";

type ArticleContainerEditorProps = {
  containerJson: ComponentObject[];
  componentClicked : (event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function ArticleContainerEditor({
  containerJson, componentClicked
}: ArticleContainerEditorProps) {
  return populateContentFromJsonArray(containerJson,componentClicked, true);
}
