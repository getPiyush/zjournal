import { useEffect } from "react";
import { TemplateRenderer, parseTemplateArticleIds } from "@zjournal/ui-library";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { getArticlesByIds } from "../datastore/actions/ArticleActions";

type TemplateRendererViewProps = {
  dataString: string;
  invalidArticleError: (articleId: string, flag: boolean) => void;
  mode: "view" | "edit";
};

export default function TemplateRendererView({ dataString, invalidArticleError, mode }: TemplateRendererViewProps) {
  const { dispatch, state: articleData } = useArticle();

  useEffect(() => {
    getArticlesByIds(dispatch, parseTemplateArticleIds(dataString));
  }, [dataString]);

  return (
    <TemplateRenderer
      dataString={dataString}
      invalidArticleError={invalidArticleError}
      mode={mode}
      articles={articleData.articles}
      status={articleData.status}
    />
  );
}
