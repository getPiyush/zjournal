import React from "react";

type PaginationProps = {
  /** Current page, 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** How many page numbers to show on each side of the current page. */
  siblings?: number;
};

type PageItem = number | "ellipsis-start" | "ellipsis-end";

// First, last, and a window around the current page, with gaps collapsed into ellipses.
export const getPageItems = (page: number, pageCount: number, siblings = 1): PageItem[] => {
  const start = Math.max(2, page - siblings);
  const end = Math.min(pageCount - 1, page + siblings);
  const items: PageItem[] = [1];

  if (start > 2) items.push("ellipsis-start");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < pageCount - 1) items.push("ellipsis-end");
  if (pageCount > 1) items.push(pageCount);

  return items;
};

export function Pagination({ page, pageCount, onPageChange, siblings = 1 }: PaginationProps) {
  if (pageCount <= 1) return null;

  const goTo = (target: number) => {
    if (target >= 1 && target <= pageCount && target !== page) onPageChange(target);
  };

  return (
    <nav aria-label="Pagination">
      <ul className="pagination justify-content-center">
        <li className={page === 1 ? "page-item disabled" : "page-item"}>
          <button type="button" className="page-link" onClick={() => goTo(page - 1)} disabled={page === 1}>
            Previous
          </button>
        </li>
        {getPageItems(page, pageCount, siblings).map((item) =>
          typeof item === "number" ? (
            <li key={item} className={item === page ? "page-item active" : "page-item"}>
              <button
                type="button"
                className="page-link"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => goTo(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="page-item disabled" aria-hidden="true">
              <span className="page-link">&hellip;</span>
            </li>
          )
        )}
        <li className={page === pageCount ? "page-item disabled" : "page-item"}>
          <button type="button" className="page-link" onClick={() => goTo(page + 1)} disabled={page === pageCount}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
