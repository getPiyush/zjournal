import { Suspense, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { Articles } from "../remotes/uiLibraryComponents";
import { useJournal } from "../datastore/contexts/JournalContext";
import { updatePage } from "../datastore/actions/JournalActions";
import { applicationProperties } from "../ApplicationConstants";
import { properties } from "../properties";
import type { ArticlesLoaderData } from "../router/loaders";

export default function ArticlesRouteView() {
  const { title, articles } = useLoaderData() as ArticlesLoaderData;
  const { dispatch: journalDispatch } = useJournal();

  useEffect(() => {
    window.document.title = `${title} - ${applicationProperties.title}`;
  }, [title]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Articles
        title={title}
        status="success"
        articles={articles}
        disableTextSelect={properties.disableTextSelect}
        onBrowseCategories={() => updatePage("categories", journalDispatch)}
        basePath=""
      />
    </Suspense>
  );
}
