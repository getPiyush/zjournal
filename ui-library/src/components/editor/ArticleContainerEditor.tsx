import { ComponentObject } from "../../Types";
import {
  ComponentReorderHandler,
  populateContentFromJsonArray,
} from "../../utils/componentUtil";

type ArticleContainerEditorProps = {
  containerJson: ComponentObject[];
  componentClicked : (event: React.MouseEvent<HTMLDivElement>) => void;
  onReorder?: ComponentReorderHandler;
};

export default function ArticleContainerEditor({
  containerJson, componentClicked, onReorder
}: ArticleContainerEditorProps) {
  return populateContentFromJsonArray(containerJson, componentClicked, true, onReorder);
}
