import { ClampedText } from "../../styles/shared";

import { parsex } from "../../utils/parserUtil";
import { ArticleT } from "../../Types";
import { Byline, ReadLink, getArticleSummary } from "./articleCardParts";
import { Cover } from "./Cover";

type HeroProps = {
  article: ArticleT;
  mode?: "view" | "edit";
};

// The lead story: image beside the text from tablet width, stacked above it on phones.
export default function HeroArticle({ article, mode = "view" }: HeroProps) {
  const { image, excerpt } = getArticleSummary(article, 320);

  return (
    <div className="card border-light mb-3 hero-article">
      <div className="row g-0 align-items-center">
        <div className="col-md-7">
          <Cover className="rounded" image={image} category={article.categryId} />
        </div>
        <div className="col-md-5">
          <div className="card-body">
            <h2>{parsex(article.title)}</h2>
            <small className="article-author text-muted">
              <Byline article={article} mode={mode} />
            </small>
            {excerpt && (
              <ClampedText $lines={5} className="lead mt-3 mb-3">
                {parsex(excerpt)}
              </ClampedText>
            )}
            <div className={excerpt ? "" : "mt-3"}>
              <ReadLink article={article} mode={mode} />
            </div>
          </div>
        </div>
      </div>
      {mode === "edit" && (
        <div className="card-footer mt-2">
          <div className="badge bg-dark">{article.id}</div>
        </div>
      )}
    </div>
  );
}
