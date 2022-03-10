import ReactHtmlParser from "react-html-parser";
import { ArticleT } from "../../../Types";
import { getDate, sliceWords } from "../../../utils/componentUtil";

type ArticleCardProps = {
  article: ArticleT;
};
export default function ArticleCard({ article }: ArticleCardProps) {
  let contentArray = [null, null];
  return (
    <div
      className="card mb-3"
      key={`key_${article.title.replace(/[^A-Z0-9]/gi, "_")}`}
    >
      <div className="card-body">
        <h5 className="card-title">{ReactHtmlParser(article.title)}</h5>
        <div className="card-text">
          Created:<b>{getDate(article.dateCreated)}</b>{" "}
        </div>
        {article.content.map((item) => {
          if (item.componenType === "Image" && !contentArray[0]) {
            contentArray[0] = item.data;
            return (
              <img
                className="card-img-top"
                alt={ReactHtmlParser(article.title)}
                src={`${contentArray[0]}`}
              />
            );
          }

          if (item.componenType === "Paragraph" && !contentArray[1]) {
            contentArray[1] = sliceWords(item.data,0,200);
            return <div className="card-text">{ ReactHtmlParser(contentArray[1])}... </div>;
          }
        })}
        <a className="card-link" href={`article/${article.id}`}>
         more..
        </a>
      </div>
    </div>
  );
}
