import { Suspense } from "react";
import { TemplateRenderer } from "../remotes/uiLibraryComponents";
import type { ArticleT } from "../types/domain";

type TemplateRendererViewProps = {
  dataString: string;
  invalidArticleError: (articleId: string, flag: boolean) => void;
  mode: "view" | "edit";
  articles: ArticleT[];
};

export default function TemplateRendererView({ dataString, invalidArticleError, mode, articles }: TemplateRendererViewProps) {
  if (!dataString) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <TemplateRenderer
        dataString={dataString}
        invalidArticleError={invalidArticleError}
        mode={mode}
        articles={articles}
        status="success"
      />
    </Suspense>
  );
}
