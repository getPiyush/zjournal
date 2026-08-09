import React from "react";

export type ArticleSortOption = "newest" | "oldest" | "title-asc" | "title-desc";

type ArticlesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: ArticleSortOption;
  onSortChange: (value: ArticleSortOption) => void;
};

export default function ArticlesToolbar({ search, onSearchChange, sortBy, onSortChange }: ArticlesToolbarProps) {
  return (
    <div className="row articles-toolbar mb-3">
      <div className="col-md-8">
        <input
          type="search"
          className="form-control"
          placeholder="Search articles..."
          aria-label="Search articles"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="col-md-4">
        <select
          className="form-select"
          aria-label="Sort articles"
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as ArticleSortOption)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
        </select>
      </div>
    </div>
  );
}
