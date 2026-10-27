import { ClampedText } from "../../styles/shared";

import { parsex } from "../../utils/parserUtil";
import { ArticleT } from "../../Types";
import { Byline, ReadLink, getArticleSummary } from "./articleCardParts";
import { Cover } from "./Cover";

type ArticleCardProps = {
  article: ArticleT;
  mode?: "view" | "edit";
  // Image beside the text instead of above it, for an article that has a row to itself.
  horizontal?: boolean;
};

export default function ArticleCard({ article, mode = "view", horizontal = false }: ArticleCardProps) {
  const { image, excerpt } = getArticleSummary(article, 200);

  const cover = (
    <Cover
      className={horizontal ? "h-100 rounded-start" : "card-img-top"}
      image={image}
      category={article.categryId}
      lazy
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
          <div className="col-md-4">{cover}</div>
          <div className="col-md-8">{body}</div>
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
