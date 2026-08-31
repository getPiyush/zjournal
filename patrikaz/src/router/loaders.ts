// Independent data-loading module for React Router. Every backend call in
// patrikaz is made from here, through the existing datastore/api.ts +
// datastore/codec.ts layer, and returned as plain loader data (or thrown as
// a Response so the nearest route errorElement can render it). Nothing here
// depends on React or on the ui-library remote's component contracts, so it
// can be reasoned about and tested independently of both.
import type { LoaderFunctionArgs } from "react-router-dom";

import {
  getJournalAPI,
  getArticleByIdAPI,
  getArticleByIdsAPI,
  getArticleByCategoryAPI,
  getArticleByAuthorAPI,
  getArticleByMonthAPI,
} from "../datastore/api";
import { decryptData } from "../datastore/codec";
import { loadUiLibrary } from "../remotes/uiLibraryModule";
import type { ArticleT, Journal } from "../types/domain";

function fail(status: number, message: string): never {
  throw new Response(message, { status });
}

// The journal is effectively static per session (categories, about-us copy,
// home template) and several routes need it, so it's fetched at most once
// and shared: the first caller kicks off the request, everyone else awaits
// the same in-flight/resolved promise instead of re-fetching.
let journalPromise: Promise<Journal> | null = null;

export function loadJournal(): Promise<Journal> {
  if (!journalPromise) {
    journalPromise = getJournalAPI()
      .then((response) => decryptData(response.data) as Journal)
      .catch((error) => {
        journalPromise = null;
        throw error;
      });
  }
  return journalPromise;
}

export async function rootLoader(): Promise<Journal> {
  try {
    return await loadJournal();
  } catch {
    fail(502, "Could not load the journal.");
  }
}

export async function homeArticlesLoader(): Promise<{ articles: ArticleT[] }> {
  const journal = await loadJournal();
  const { parseTemplateArticleIds } = await loadUiLibrary();
  const articleIds = parseTemplateArticleIds(journal.templateData ?? "");

  if (articleIds.length === 0) {
    return { articles: [] };
  }

  try {
    const response = await getArticleByIdsAPI(articleIds);
    return { articles: decryptData(response.data) as ArticleT[] };
  } catch {
    fail(502, "Could not load the home articles.");
  }
}

export async function articleLoader({ params }: LoaderFunctionArgs): Promise<ArticleT> {
  const articleId = params.articleId as string;
  let article: ArticleT | undefined;
  try {
    const response = await getArticleByIdAPI(articleId);
    article = decryptData(response.data) as ArticleT;
  } catch {
    fail(502, `Could not load article ${articleId}.`);
  }

  // The API returns 200 with an empty/partial payload for an unknown id
  // rather than a 404, so a missing id/content is the only signal we have
  // that nothing was actually found.
  if (!article || !article.id || !article.content) {
    fail(404, `Article ${articleId} was not found.`);
  }

  return article;
}

export type ArticlesLoaderData = { title: string; articles: ArticleT[] };

export async function articlesLoader({ request }: LoaderFunctionArgs): Promise<ArticlesLoaderData> {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get("categoryId") ?? "";
  const blogDate = url.searchParams.get("blogdate") ?? "";
  const authorId = url.searchParams.get("authorId") ?? "";

  try {
    if (categoryId) {
      const response = await getArticleByCategoryAPI(categoryId, true);
      return { title: categoryId, articles: decryptData(response.data) as ArticleT[] };
    }

    if (blogDate) {
      const [year, month] = blogDate.split("-");
      const [response, { months }] = await Promise.all([getArticleByMonthAPI(blogDate, true), loadUiLibrary()]);
      return {
        title: `${months[Number(month) - 1]} ${year} `,
        articles: decryptData(response.data) as ArticleT[],
      };
    }

    if (authorId) {
      const response = await getArticleByAuthorAPI(authorId, true);
      return { title: authorId, articles: decryptData(response.data) as ArticleT[] };
    }

    const response = await getArticleByCategoryAPI("", true);
    return { title: "All", articles: decryptData(response.data) as ArticleT[] };
  } catch {
    fail(502, "Could not load articles.");
  }
}
