import { useLoaderData } from "react-router-dom";

import { applicationProperties } from "../ApplicationConstants";
import { useJournal } from "../datastore/contexts/JournalContext";
import TemplateRendererView from "../components/TemplateRendererView";
import type { ArticleT } from "../types/domain";

export default function Home() {
  const { state: jState } = useJournal();
  const { articles } = useLoaderData() as { articles: ArticleT[] };

  window.document.title = `Home - ${applicationProperties.title}`;

  const invalidArticleFound = (articleId: string) => {
    console.log("Invalid Article Found ", articleId);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <TemplateRendererView
            invalidArticleError={invalidArticleFound}
            dataString={jState.journal.templateData}
            articles={articles}
            mode="view"
          />
        </div>
      </div>
    </div>
  );
}
