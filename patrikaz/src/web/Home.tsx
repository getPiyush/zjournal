import { applicationProperties } from "../ApplicationConstants";
import { useJournal } from "../datastore/contexts/JournalContext";
import TemplateRendererView from "../components/TemplateRendererView";

export default function Home() {
  const { state: jState } = useJournal();

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
            mode="view"
          />
        </div>
      </div>
    </div>
  );
}
