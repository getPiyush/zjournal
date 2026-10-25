import { applicationProperties } from "../ApplicationConstants";
import { httpClient } from "./http-client";
import { encryptOutData } from "./codec";

import { ArticleT, Contact, Journal, QnA } from "@zjournal/ui-library";

const server = applicationProperties.serverUrl;

const getJournalAPIPath = `${server}/journal`;
const getArticleAPIPath = `${server}/articles`;
const getContactsAPIPath = `${server}/contacts`;
const getQnAsAPIPath = `${server}/qna`;


// request methos

const getRequest = (url) => {
    return httpClient.get(url);
}

const withJsonContentType = (params: { headers?: Record<string, string> } = {}) => ({
    ...params,
    headers: {
        ...params.headers,
        "Content-Type": "application/json"
    }
});

const putRequest = (url, obj) => {
    const payload = encryptOutData(obj);
    return httpClient.put(url, payload, withJsonContentType());
}

const postRequest = (url, obj) => {
    const payload = encryptOutData(obj);
    return httpClient.post(url, payload, withJsonContentType());
}

const deleteRequest = (url) => {
    return httpClient.delete(url);
}


/**
 * 
Journal APIS
 */

export const getJournalAPI = () => {
    return getRequest(getJournalAPIPath);
}


export const updateJournalAPI = (journal: Journal) => {
    const url = `${getJournalAPIPath}`;
    // currentArticle is the admin editor's in-tab working copy (possibly an unpublished draft),
    // not a setting: don't store it with the journal.
    const { currentArticle, ...settings } = journal;
    return putRequest(url, settings);
}



/**
 * 
Article APIS
 */
export const getArticleByIdAPI = (id: string) => {
    const url = `${getArticleAPIPath}/${id}`;
    return getRequest(url);
}

export const getArticleByIdsAPI = (ids: string[]) => {
    const idUrl = ids.join('&id=');
    const url = `${getArticleAPIPath}?id=${idUrl}`;
    return getRequest(url);
}

// What the public site may list: published, and not on the admin's purge list.
const PUBLIC_ARTICLE_FILTERS = ["published=true", "deleteFlag=false"];

const articlesQuery = (filters: string[], web: boolean) => {
    const params = [...filters, ...(web ? PUBLIC_ARTICLE_FILTERS : [])];
    return `${getArticleAPIPath}${params.length > 0 ? `?${params.join("&")}` : ``}`;
}

export const getArticleByCategoryAPI = (category: string, web: boolean) => {
    const filters = category !== "" ? [`categryId=${encodeURIComponent(category)}`] : [];
    return getRequest(articlesQuery(filters, web));
}

export const getArticleByAuthorAPI = (author: string, web: boolean) => {
    const filters = author !== "" ? [`author=${encodeURIComponent(author)}`] : [];
    return getRequest(articlesQuery(filters, web));
}

export const getArticleByMonthAPI = (blogDate: string, web: boolean) => {
    return getRequest(articlesQuery([`createdAt_like=${blogDate}`], web));
}

// GET /articles/search: filtered, sorted and paged by the server (see server/SEARCH.md).
// Responds with { items, total, page, limit }.
export const searchArticlesAPI = (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return getRequest(`${getArticleAPIPath}/search${query ? `?${query}` : ""}`);
}

export const getArticlesToDeleteAPI = () => {
    const url = `${getArticleAPIPath}?&deleteFlag=true`;
    return getRequest(url);
}

export const addArticleAPI = (article: ArticleT) => {
    const url = `${getArticleAPIPath}`;
    return postRequest(url, article);
}

export const updateArticleAPI = (article: ArticleT) => {
    const url = `${getArticleAPIPath}/${article.id}`;
    return putRequest(url, article);
}

export const deleteArticleAPI = (article: ArticleT) => {
    const url = `${getArticleAPIPath}/${article.id}`;
    return deleteRequest(url);
}



/**
 * 
Journal APIS
 */

export const getContactsAPI = () => {
    return getRequest(`${getContactsAPIPath}?_sort=createdAt&_order=desc`);
}


export const addContactAPI = (contact: Contact) => {
    const url = `${getContactsAPIPath}`;
    return postRequest(url, contact);
}


/**
 * QnA
 * addQnAAPI, getQnAsAPI
 */

export const getQnAsAPI = () => {
    return getRequest(`${getQnAsAPIPath}?_sort=createdAt&_order=desc`);
}


export const addQnAAPI = (qna: QnA) => {
    const url = `${getQnAsAPIPath}`;
    return postRequest(url, qna);
}

export const deleteQnAAPI = (id: string) => {
    const url = `${getQnAsAPIPath}/${id}`;
    return deleteRequest(url);
}
