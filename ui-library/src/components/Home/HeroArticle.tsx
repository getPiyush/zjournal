import React, { useEffect, useState } from "react";
import { ArticleT } from "../../Types";
import { parsex } from "../../utils/parserUtil";
import { getDate, sliceWords, removeHTML } from "../../utils/componentUtil";

type HeroProps = {
  article: ArticleT;
  mode?: "view" | "edit";
};

export default function HeroArticle({ article, mode = "view" }: HeroProps) {
  return (
    <div className="hero-article">
      <h2>{parsex(article.title)}</h2>
      <p>{sliceWords(removeHTML(article.content[0]?.data || ""), 0, 250)}</p>
      <small>By {article.author} on {getDate(article.dateCreated)}</small>
    </div>
  );
}
