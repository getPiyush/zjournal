import { applicationProperties } from "../ApplicationConstants";
import { httpClient } from "./http-client";
import { encryptOutData } from "./codec";

import type { Journal } from "../types/domain";

const server = applicationProperties.serverUrl;

const getJournalAPIPath = `${server}/journal`;
const getArticleAPIPath = `${server}/articles`;

// request methods

const getRequest = (url) => {
  return httpClient.get(url);
};

const withJsonContentType = (params: { headers?: Record<string, string> } = {}) => ({
  ...params,
  headers: {
    ...params.headers,
    "Content-Type": "application/json",
  },
});

const putRequest = (url, obj) => {
  const payload = encryptOutData(obj);
  return httpClient.put(url, payload, withJsonContentType());
};

/**
 * Journal APIs
 */

export const getJournalAPI = () => {
  return getRequest(getJournalAPIPath);
};

export const updateJournalAPI = (journal: Journal) => {
  const url = `${getJournalAPIPath}`;
  return putRequest(url, journal);
};

/**
 * Article APIs
 */
export const getArticleByIdAPI = (id: string) => {
  const url = `${getArticleAPIPath}/${id}`;
  return getRequest(url);
};

export const getArticleByIdsAPI = (ids: string[]) => {
  const idUrl = ids.join("&id=");
  const url = `${getArticleAPIPath}?id=${idUrl}`;
  return getRequest(url);
};

export const getArticleByCategoryAPI = (category: string, web: boolean) => {
  const params = [];
  if (category !== "") params.push(`categryId=${category}`);
  if (web) params.push(`published=true`);
  const url = `${getArticleAPIPath}${params.length > 0 ? `?${params.join("&")}` : ``}`;
  return getRequest(url);
};

export const getArticleByAuthorAPI = (author: string, web: boolean) => {
  const authorParam = author !== "" ? `?author=${encodeURIComponent(author)}` : ``;
  const publishedParam = web ? `&published=true` : ``;
  const url = `${getArticleAPIPath}${authorParam}${publishedParam}`;
  return getRequest(url);
};

export const getArticleByMonthAPI = (blogDate: string, web: boolean) => {
  const url = `${getArticleAPIPath}?createdAt_like=${blogDate}${web ? `&published=true` : ``}`;
  return getRequest(url);
};
