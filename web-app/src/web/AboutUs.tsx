import { parsex } from "@zjournal/ui-library";
import { applicationProperties } from "../ApplicationConstants";
import { useJournal } from "../datastore/contexts/JournalContext";
import CategoryCards from "./CategoryCards";

const pipelineSteps = [
  {
    title: "Curated sources",
    text: "Each category has a hand-picked list of reputable websites (journals, magazines, museums, space agencies) to read from.",
  },
  {
    title: "Polite collection",
    text: "A collector visits those sites, checks each site's robots.txt first, and rate-limits its requests. Sites that block it or are unreachable are skipped.",
  },
  {
    title: "Summarized, not copied",
    text: "For each new article it keeps the title, author, publish date, a short summary and the hero image, plus a link back to the full original.",
  },
  {
    title: "Sorted and de-duplicated",
    text: "Articles are tagged with their source's category, and links that have been seen before are skipped, so the same story never appears twice.",
  },
  {
    title: "Reviewed and published",
    text: "New batches are reviewed before they're merged into the journal, and only articles marked as published appear on this site.",
  },
];

export default function AboutUs() {
  window.document.title = `About - ${applicationProperties.title}`;
  const { state: jState } = useJournal();
  const { aboutUs, categories = [] } = jState.journal;
  const browsableCategories = categories.filter((category) => category !== "All");

  return (
    <div className="about-us container">
      {aboutUs && (
        <section className="about-us-intro mb-5">{parsex(aboutUs)}</section>
      )}

      {browsableCategories.length > 0 && (
        <section className="about-us-categories mb-5" aria-labelledby="about-categories-heading">
          <h4 id="about-categories-heading">What we cover</h4>
          <p className="text-muted">
            Articles are organized into {browsableCategories.length} categories. Pick one to
            browse everything in it.
          </p>
          <CategoryCards categories={browsableCategories} />
        </section>
      )}

      <section className="about-us-pipeline mb-5" aria-labelledby="about-pipeline-heading">
        <h4 id="about-pipeline-heading">How articles get here</h4>
        <ol className="about-us-steps list-unstyled">
          {pipelineSteps.map((step, index) => (
            <li className="d-flex mb-3" key={step.title}>
              <span className="about-us-step-number me-3">{index + 1}</span>
              <div>
                <h6 className="mb-1">{step.title}</h6>
                <p className="small text-muted mb-0">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="small">
          Every article credits its original author and links to the source. Read the full piece
          there.
        </p>
      </section>
    </div>
  );
}
