import { ClampedText, CoverImage } from "../../styles/shared";

import { parsex } from "../../utils/parserUtil";
import { ArticleT } from "../../Types";
import { Byline, ReadLink, getArticleSummary, hideBrokenImage } from "./articleCardParts";

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
        {image && (
          <div className="col-md-7">
            {/* alt is empty: the image illustrates the title right next to it. */}
            <CoverImage className="rounded" alt="" src={image} onError={hideBrokenImage} />
          </div>
        )}
        <div className={image ? "col-md-5" : "col-12"}>
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
