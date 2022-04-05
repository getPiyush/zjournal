import React, { useEffect } from "react";
import { applicationProperties } from "../ApplicationConstants";
import { getArticlesByIds } from "../datastore/actions/ArticleActions";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { getArticleFromId } from "../utils/componentUtil";
import { ArticleScroller } from "./components/ArticleScroller";
import ArticleCard from "./components/Home/ArticleCard";
import HeroArticle from "./components/Home/HeroArticle";
import { TemplateRenderer } from "./components/Templates/TemplateRenderer";

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
          <TemplateRenderer
            invalidArticleError={invalidArticleFound}
            dataString={jState.journal.templateData}
          />
        </div>
      </div>
      {/** 
        * <div className="row">
          <div className="col">
            <ArticleScroller/>
          </div>
        </div>
        */}
    </div>
  );
}
