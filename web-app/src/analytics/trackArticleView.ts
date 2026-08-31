import { applicationProperties } from "../ApplicationConstants";

type TrackableArticle = {
  id: string;
  title: string;
  categryId: string;
  author: string;
};

/**
 * Best-effort view tracking against the standalone analytics service (../../analytics).
 * Fire-and-forget: a dropped/unreachable analytics call must never affect the reading
 * experience, so failures are swallowed rather than surfaced.
 */
export function trackArticleView(article: TrackableArticle): void {
  if (!article.id) return;

  fetch(`${applicationProperties.analyticsUrl}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      application: applicationProperties.applicationName,
      articleId: article.id,
      articleTitle: article.title,
      category: article.categryId,
      author: article.author,
    }),
  }).catch(() => {});
}
