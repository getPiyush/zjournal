import { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { CategoryIcon, categoryHue } from "@zjournal/ui-library";

// One line per category the journal ships with. Categories an admin adds later still get a card,
// just without a description.
export const categoryDescriptions: Record<string, string> = {
  Art: "Painting, design, museums and the stories behind the work.",
  Engineering: "How things are built: structures, machines and the people who design them.",
  History: "Archaeology, past civilizations and the events that shaped today.",
  Mathematics: "Proofs, puzzles and the ideas underneath everything else.",
  Medicine: "Health research, clinical breakthroughs and public health.",
  Philosophy: "Ethics, mind, and the big questions, old and new.",
  Physics: "From particles to cosmology: how the universe works.",
  Psychology: "Behaviour, the brain and why we think the way we do.",
  Science: "Discoveries across biology, chemistry, climate and beyond.",
  "Software Development": "Programming, the web platform and engineering practice.",
  Space: "Missions, telescopes, planets and the search for life.",
  Technology: "Gadgets, AI, the internet and how tech changes daily life.",
};

// A grid of cards, one per category, each linking to that category's articles. Each card carries
// its category's icon as a faint background, in the same tint the article placeholders use.
export default function CategoryCards({ categories }: { categories: string[] }) {
  return (
    <div className="row g-3">
      {categories.map((category) => (
        <div className="col-12 col-sm-6 col-lg-4" key={category}>
          <Link
            className="category-card card h-100 text-decoration-none"
            to={`/web/articles?categoryId=${encodeURIComponent(category)}`}
            style={{ "--category-hue": categoryHue(category) } as CSSProperties}
          >
            <span className="category-card-art">
              <CategoryIcon category={category} />
            </span>
            <div className="card-body">
              <h6 className="card-title mb-1">{category}</h6>
              {categoryDescriptions[category] && (
                <p className="card-text small text-muted mb-0">{categoryDescriptions[category]}</p>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
