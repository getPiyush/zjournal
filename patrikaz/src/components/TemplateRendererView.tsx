import { Suspense, useEffect, useState } from "react";
import { TemplateRenderer } from "../remotes/uiLibraryComponents";
import { loadUiLibrary } from "../remotes/uiLibraryModule";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { getArticlesByIds } from "../datastore/actions/ArticleActions";

type TemplateRendererViewProps = {
  dataString: string;
  invalidArticleError: (articleId: string, flag: boolean) => void;
  mode: "view" | "edit";
};

export default function TemplateRendererView({ dataString, invalidArticleError, mode }: TemplateRendererViewProps) {
  const { dispatch, state: articleData } = useArticle();
  const [articleIds, setArticleIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadUiLibrary().then(({ parseTemplateArticleIds }) => {
      if (cancelled) return;
      const ids = parseTemplateArticleIds(dataString);
      setArticleIds(ids);
      getArticlesByIds(dispatch, ids);
    });
    return () => {
      cancelled = true;
    };
  }, [dataString]);

  if (articleIds.length === 0 && dataString === "") {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <TemplateRenderer
        dataString={dataString}
        invalidArticleError={invalidArticleError}
        mode={mode}
        articles={articleData.articles}
        status={articleData.status}
      />
    </Suspense>
  );
}
