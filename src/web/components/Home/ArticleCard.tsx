import { parsex } from "../../../utils/parserUtil";
import { ArticleT } from "../../../Types";
import { getDate, removeHTML, sliceWords } from "../../../utils/componentUtil";

type ArticleCardProps = {
  article: ArticleT;
  mode?:"view"|"edit";

};
export default function ArticleCard({ article, mode="view" }: ArticleCardProps) {
  let contentArray = [null, null];
  return (
    <div
      className="card mb-3"
      key={`key_${article.title.replace(/[^A-Z0-9]/gi, "_")}`}
    >
      <div className="card-body">
        <h5 className="card-title">{parsex(article.title)}</h5>
        <div className="card-text">
          Created:<b>{getDate(article.dateCreated)}</b>{" "}
        </div>
        {article.content.map((item, index) => {
          if (item.componenType === "Image" && !contentArray[0]) {
            contentArray[0] = item.data;
            return (
              <img
                key={`articlecomp_${index}_${item.componenType}`}
                className="card-img-top"
                alt={article.title}
                title={article.title}
                src={`${contentArray[0]}`}
              />
            );
          }

          if (item.componenType === "Paragraph" && !contentArray[1]) {
            contentArray[1] = sliceWords(removeHTML(item.data), 0, 200);
            return (
              <div
                key={`articlecomp_${index}_${item.componenType}`}
                className="card-text"
              >
                {parsex(contentArray[1])}...{" "}
              </div>
            );
          }
        })}
        {mode==="view" && 
        <a className="card-link" href={`article/${article.id}`}>
          more..
        </a>
        }
        {mode==="edit" && <a target="_blank" href={`/web/article/${article.id}`}>more..</a>}
         {mode==="edit" && <div className="card-footer mt-2"><div className="badge bg-dark">{article.id}</div></div>}
      </div>
    </div>
  );
}
