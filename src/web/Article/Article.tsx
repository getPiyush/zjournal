import { ArticleT } from "../../Types";
import ArticleContainer from "./ArticleContainer";

type ArticleProps = {
  data: ArticleT;
};

export default function Article( {data}:ArticleProps) {

  return (
    <div className="container disable-text-selection">
      <h1 className="mt-5">{data.title}</h1>
      <span>By {data.author} on {data.dateCreated.toDateString()}</span>
      <ArticleContainer containerJson={data.content}/>
    </div>
  );
}
