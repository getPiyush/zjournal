import { ArticleT } from "../../../Types";
import ArticleContainer from "./ArticleContainer";

type ArticleProps = {
  data: ArticleT;
};

export default function Article({ data }: ArticleProps) {
  console.log(data);
  return (
    <div className="container article-viewer disable-text-selection">
      <h1>{data.title}</h1>
      <div className="sub-header">
        <span>
          By <b>{data.author}</b> on {data?.dateCreated?.toDateString()}
        </span>
        <div>
          <span className="badge bg-success">
            {data.categryId}
          </span>
        </div>
      </div>
      <ArticleContainer containerJson={data.content} />
    </div>
  );
}
