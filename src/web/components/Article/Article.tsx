import { ArticleT } from "../../../Types";
import { getDate } from "../../../utils/componentUtil";
import ArticleContainer from "./ArticleContainer";

type ArticleProps = {
  data: ArticleT;
};

export default function Article({ data }: ArticleProps) {
  return (
    <div className="container article-viewer disable-text-selection">
      <h1>{data.title}</h1>
      <div className="sub-header">
        <span>
          By <b>{data.author}</b> on {getDate(data.dateCreated)}
        </span>
        <div>
          <span className="badge bg-success">{data.categryId}</span>
        </div>
      </div>
      <ArticleContainer containerJson={data.content} />
    </div>
  );
}
