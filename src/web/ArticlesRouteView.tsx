import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Articles, months } from "@zjournal/ui-library";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import { getArticlesBycategory, getArticlesByBlogDate } from "../datastore/actions/ArticleActions";
import { updatePage } from "../datastore/actions/JournalActions";
import { applicationProperties } from "../ApplicationConstants";
import { properties } from "../properties";

export default function ArticlesRouteView() {
  const path = useLocation().pathname;
  const [params] = useSearchParams();
  const categoryId = params.getAll("categoryId")[0];
  const blogDate = params.getAll("blogdate")[0];

  const isArticleByCategory = path.search("/articles") !== -1 && categoryId && categoryId !== "";
  const isArticleByBlog = path.search("/articles") !== -1 && blogDate && blogDate !== "";

  const { dispatch, state: articleData } = useArticle();
  const { dispatch: journalDispatch } = useJournal();

  let title = "";
  if (isArticleByCategory) title = `${categoryId}`;
  if (isArticleByBlog) {
    const yearMonth = blogDate.split("-");
    title = `${months[Number(yearMonth[1]) - 1]} ${yearMonth[0]} `;
  }

  useEffect(() => {
    window.document.title = `${title} - ${applicationProperties.title}`;
  }, [title]);

  useEffect(() => {
    if (isArticleByCategory) {
      getArticlesBycategory(dispatch, categoryId, true);
    } else if (isArticleByBlog) {
      getArticlesByBlogDate(dispatch, blogDate, true);
    }
  }, [categoryId, blogDate]);

  return (
    <Articles
      title={title}
      status={articleData.status}
      articles={articleData.articles}
      disableTextSelect={properties.disableTextSelect}
      onBrowseCategories={() => updatePage("categories", journalDispatch)}
    />
  );
}
