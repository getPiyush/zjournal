import { SyntheticEvent } from "react";
import { Link } from "react-router-dom";

import { ArticleT } from "../../Types";
import { getDate, removeHTML, sliceWords } from "../../utils/componentUtil";

type Mode = "view" | "edit";

// The "Read article" link stretches over the whole card; links inside the card sit above it.
const aboveStretchedLink = { zIndex: 2 };

// The first image and the opening text of an article, as shown on the home page cards.
// `excerpt` is cut at a word boundary near `excerptLength` characters and ends in "…" when cut.
export const getArticleSummary = (article: ArticleT, excerptLength: number) => {
  const imageItem = article.content.find((item) => item.componenType === "Image");
  const paragraphItem = article.content.find((item) => item.componenType === "Paragraph");

  const image = imageItem
    ? typeof imageItem.data === "string"
      ? imageItem.data
      : imageItem.data[0] || ""
    : "";

  let excerpt = "";
  if (paragraphItem) {
    const text = removeHTML(paragraphItem.data);
    excerpt = sliceWords(text, 0, excerptLength);
    if (excerpt.length < text.length) excerpt = `${excerpt.trimEnd()}…`;
  }

  return { image, excerpt };
};

// Hides an image whose source fails to load, rather than showing a broken-image box.
export const hideBrokenImage = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.display = "none";
};

// "By <author> · <date>", with the author linking to their articles in view mode.
export const Byline = ({ article, mode }: { article: ArticleT; mode: Mode }) => {
  const created = new Date(article.createdAt);
  return (
    <>
      {article.author && (
        <>
          By{" "}
          {mode === "view" ? (
            <Link
              className="position-relative"
              style={aboveStretchedLink}
              to={`/web/articles?authorId=${encodeURIComponent(article.author)}`}
            >
              {article.author}
            </Link>
          ) : (
            <b>{article.author}</b>
          )}
          {" · "}
        </>
      )}
      <time dateTime={isNaN(created.getTime()) ? undefined : created.toISOString()}>
        {getDate(article.createdAt)}
      </time>
    </>
  );
};

// In view mode the link covers the whole card; in edit mode it opens the public page in a new tab.
export const ReadLink = ({ article, mode }: { article: ArticleT; mode: Mode }) =>
  mode === "view" ? (
    <Link className="card-link stretched-link" to={`/web/article/${article.id}`}>
      Read article <span aria-hidden="true">→</span>
    </Link>
  ) : (
    <a target="_blank" href={`/web/article/${article.id}`}>
      more..
    </a>
  );
