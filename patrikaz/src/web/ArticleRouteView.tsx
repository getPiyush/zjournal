import { Suspense, useEffect, useRef } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import { Article } from "../remotes/uiLibraryComponents";
import { useJournal } from "../datastore/contexts/JournalContext";
import { updatePage } from "../datastore/actions/JournalActions";
import { applicationProperties } from "../ApplicationConstants";
import { properties } from "../properties";
import type { ArticleT } from "../types/domain";
import { trackArticleView } from "../analytics/trackArticleView";

export default function ArticleRouteView() {
  const { articleId } = useParams();
  const loaderArticle = useLoaderData() as ArticleT | undefined;
  const { state: jState, dispatch: journalDispatch } = useJournal();

  const article = articleId ? (loaderArticle ?? null) : jState.journal.currentArticle;

  useEffect(() => {
    if (articleId && article) {
      window.document.title = `${article.title} - ${applicationProperties.title}`;
    }
  }, [articleId, article]);

  const trackedArticleIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (articleId && article && trackedArticleIdRef.current !== article.id) {
      trackedArticleIdRef.current = article.id;
      trackArticleView(article);
    }
  }, [articleId, article]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Article
        article={article}
        status="success"
        disableTextSelect={properties.disableTextSelect}
        onBrowseCategories={() => updatePage("categories", journalDispatch)}
        basePath=""
      />
    </Suspense>
  );
}
