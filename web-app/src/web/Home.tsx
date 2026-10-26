import { useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationProperties } from "../ApplicationConstants";
import { useJournal } from "../datastore/contexts/JournalContext";
import TemplateRendererView from "../components/TemplateRendererView";

export default function Home() {
  const { state: jState } = useJournal();
  const categories = (jState.journal.categories || []).filter((category) => category !== "All");

  useEffect(() => {
    window.document.title = `Home - ${applicationProperties.title}`;
  }, []);

  const invalidArticleFound = (articleId: string) => {
    console.log("Invalid Article Found ", articleId);
  };

  return (
    <div className="container">
      <section className="home-intro" aria-labelledby="home-intro-text">
        <p className="lead mb-3" id="home-intro-text">
          Hand-picked reading from reputable sources: short summaries, each with a link to the
          full original.
        </p>
        {categories.length > 0 && (
          <nav className="category-strip" aria-label="Browse by category">
            {categories.map((category) => (
              <Link
                key={category}
                className="btn btn-sm btn-outline-secondary rounded-pill"
                to={`/web/articles?categoryId=${encodeURIComponent(category)}`}
              >
                {category}
              </Link>
            ))}
          </nav>
        )}
      </section>
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
