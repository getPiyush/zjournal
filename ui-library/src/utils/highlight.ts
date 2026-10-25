const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wraps every case-insensitive match of `words` in <mark> (unpadded, so words don't spread apart), in the text parts of an HTML string
// only: tags and entities (&amp;) are left whole, so the markup stays valid.
export const highlightHtml = (html: string, words: string[]) => {
  // Longest first, so "mars" doesn't stop "marsupial" from being marked whole.
  const terms = Array.from(new Set(words.map((word) => word.trim()).filter(Boolean))).sort(
    (a, b) => b.length - a.length
  );
  if (terms.length === 0) return html;

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  return html
    .split(/(<[^>]*>|&#?\w+;)/)
    .map((part) => (part.startsWith("<") || /^&#?\w+;$/.test(part) ? part : part.replace(pattern, '<mark class="p-0">$1</mark>')))
    .join("");
};
