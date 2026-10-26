import { ClampedText, CoverImage } from "../../styles/shared";

import { parsex } from "../../utils/parserUtil";
import { ArticleT } from "../../Types";
import { Byline, ReadLink, getArticleSummary, hideBrokenImage } from "./articleCardParts";

type ArticleCardProps = {
  article: ArticleT;
  mode?: "view" | "edit";
  // Image beside the text instead of above it, for an article that has a row to itself.
  horizontal?: boolean;
};

export default function ArticleCard({ article, mode = "view", horizontal = false }: ArticleCardProps) {
  const { image, excerpt } = getArticleSummary(article, 200);

  // alt is empty: the image illustrates the title right next to it.
  const cover = image && (
    <CoverImage
      className={horizontal ? "h-100 rounded-start" : "card-img-top"}
      alt=""
      loading="lazy"
      src={image}
      onError={hideBrokenImage}
    />
  );

  const body = (
    <div className="card-body d-flex flex-column h-100">
      <h5 className="card-title">{parsex(article.title)}</h5>
      {excerpt && (
        <ClampedText $lines={3} className="card-text">
          {parsex(excerpt)}
        </ClampedText>
      )}
      <div className="mt-auto pt-3">
        <div className="small text-muted article-author mb-1">
          <Byline article={article} mode={mode} />
        </div>
        <ReadLink article={article} mode={mode} />
      </div>
    </div>
  );

  return (
    <div className="card mb-3 article-card">
      {horizontal ? (
        <div className="row g-0 h-100">
          {cover && <div className="col-md-4">{cover}</div>}
          <div className={cover ? "col-md-8" : "col-12"}>{body}</div>
        </div>
      ) : (
        <>
          {cover}
          {body}
        </>
      )}
      {mode === "edit" && (
        <div className="card-footer">
          <div className="badge bg-dark">{article.id}</div>
        </div>
      )}
    </div>
  );
}
