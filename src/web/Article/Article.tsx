import { ArticleT } from "../../Types";
import ArticleContainer from "./ArticleContainer";

type ArticleProps = {
  data: ArticleT;
};

export default function Article({ data }: ArticleProps) {
  console.log(data);
  return (
    <div className="container disable-text-selection">
      <h1 className="mt-5">{data.title}</h1>
      <div className="sub-header">
        <span>By {data.author} on {data.dateCreated.toDateString()}</span>
        <span className="badge rounded-pill bg-success">{data.categryId}</span>
      </div>
      <ArticleContainer containerJson={data.content} />
    </div>
  );
}
