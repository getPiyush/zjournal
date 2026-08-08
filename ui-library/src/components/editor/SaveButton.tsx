import { ArticleT } from "../../Types";
import { getUid } from "../../utils/componentUtil";

type SaveButtonProps = {
  article: ArticleT;
  onSave: (article: ArticleT, isNew: boolean) => void;
};

export default function SaveButton({ article, onSave }: SaveButtonProps) {
  const saveArticle = () => {
    const isNew = article.origin === "local";
    const finalArticle = isNew
      ? { ...article, id: getUid(), origin: "server" as const }
      : { ...article, dateModified: new Date() };
    onSave(finalArticle, isNew);
  };

  return (
    <button
      className="btn btn-primary btn-sm"
      disabled={article.title === "" || article.content.length === 0}
      onClick={saveArticle}
    >
      <i className="bi bi-pencil"></i>&nbsp;&nbsp;
      {article.origin === "local" ? "Add Article" : "Update Article"}
    </button>
  );
}
