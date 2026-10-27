import { ReactElement } from "react";

// Line-art icons for the placeholder shown when an article has no usable image. Drawn on a
// 64×64 grid in currentColor, so each takes its category's placeholder tint.
const icons: Record<string, ReactElement> = {
  art: (
    <>
      <path d="M32 8C18 8 8 18 8 30c0 11 9 18 17 18 4 0 5-3 4-6s1-6 5-6h8c7 0 14-5 14-14C56 14 45 8 32 8z" />
      <circle cx="20" cy="27" r="3" />
      <circle cx="27" cy="17" r="3" />
      <circle cx="39" cy="17" r="3" />
      <circle cx="46" cy="27" r="3" />
      <path d="M44 42l12 14" />
    </>
  ),
  engineering: (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <path key={angle} d="M28.5 15.5V9h7v6.5" transform={`rotate(${angle} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="17" />
      <circle cx="32" cy="32" r="7" />
    </>
  ),
  history: (
    <>
      <path d="M8 22L32 9l24 13z" />
      <path d="M12 26h40M12 50h40M8 56h48" />
      <path d="M17 30v16M27 30v16M37 30v16M47 30v16" />
    </>
  ),
  mathematics: (
    <>
      <path d="M40 10H14l13 16-13 16h26" />
      <path d="M44 46l12 12M56 46L44 58" />
      <path d="M44 16h12M50 10v12" />
    </>
  ),
  medicine: (
    <>
      <path d="M32 54S8 40 8 24c0-8 6-13 12-13 5 0 9 3 12 7 3-4 7-7 12-7 6 0 12 5 12 13 0 16-24 30-24 30z" />
      <path d="M12 32h11l4-8 6 16 4-8h15" />
    </>
  ),
  philosophy: (
    <>
      <path d="M10 14h44v28H30l-12 10v-10h-8z" />
      <path d="M27 23c0-3 2-5 5-5s5 2 5 5c0 4-5 4-5 8" />
      <circle cx="32" cy="36" r="0.5" strokeWidth="3" />
    </>
  ),
  physics: (
    <>
      <ellipse cx="32" cy="32" rx="24" ry="9" />
      <ellipse cx="32" cy="32" rx="24" ry="9" transform="rotate(60 32 32)" />
      <ellipse cx="32" cy="32" rx="24" ry="9" transform="rotate(120 32 32)" />
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </>
  ),
  psychology: (
    <>
      <path d="M24 56v-9c-7-4-12-11-12-20 0-11 9-19 20-19s20 8 20 18l5 9h-5v7c0 3-2 5-5 5h-5v9" />
      <path d="M32 28a4 4 0 1 1 4 4c-6 0-9-4-9-8a9 9 0 0 1 18 0" />
    </>
  ),
  science: (
    <>
      <path d="M25 8h14M27 8v18L12 52c-1 2 0 4 3 4h34c3 0 4-2 3-4L37 26V8" />
      <path d="M18 42h28" />
      <circle cx="28" cy="48" r="2" />
      <circle cx="37" cy="46" r="1.5" />
    </>
  ),
  "software development": (
    <>
      <rect x="6" y="10" width="52" height="44" rx="4" />
      <path d="M6 20h52" />
      <path d="M26 30l-8 7 8 7M38 30l8 7-8 7" />
    </>
  ),
  space: (
    <>
      <circle cx="30" cy="34" r="12" />
      <ellipse cx="30" cy="34" rx="24" ry="7" transform="rotate(-20 30 34)" />
      <path d="M50 8v8M46 12h8M12 10v4M10 12h4M52 48v4M50 50h4" />
    </>
  ),
  technology: (
    <>
      <rect x="16" y="16" width="32" height="32" rx="3" />
      <rect x="25" y="25" width="14" height="14" rx="1" />
      <path d="M24 8v8M32 8v8M40 8v8M24 48v8M32 48v8M40 48v8M8 24h8M8 32h8M8 40h8M48 24h8M48 32h8M48 40h8" />
    </>
  ),
};

// Any category without its own icon gets a page of text.
const articleIcon = (
  <>
    <path d="M16 8h24l10 10v38H16z" />
    <path d="M40 8v10h10" />
    <path d="M23 28h20M23 36h20M23 44h13" />
  </>
);

// A stack of pages, for "All articles" in the category panel.
export const allArticlesIcon = (
  <>
    <rect x="18" y="16" width="34" height="40" rx="3" />
    <path d="M12 48V12a4 4 0 0 1 4-4h28" />
    <path d="M25 28h20M25 36h20M25 44h13" />
  </>
);

// Placeholder tints for the journal's categories, 30° apart on the colour wheel so no two match.
const hues: Record<string, number> = {
  art: 0,
  psychology: 30,
  science: 60,
  history: 90,
  technology: 120,
  medicine: 150,
  "software development": 180,
  engineering: 210,
  mathematics: 240,
  philosophy: 270,
  physics: 300,
  space: 330,
};

// A stable hue per category, so every card in a category gets the same placeholder tint. Other
// categories get one from their name.
export const categoryHue = (category: string = "") => {
  const key = category.trim().toLowerCase();
  if (key in hues) return hues[key];
  return [...key].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 360, 7);
};

export const hasCategoryIcon = (category: string = "") => category.trim().toLowerCase() in icons;

export const CategoryIcon = ({ category, children }: { category: string; children?: ReactElement }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children || icons[(category || "").trim().toLowerCase()] || articleIcon}
  </svg>
);
