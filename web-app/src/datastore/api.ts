import { applicationProperties } from "../ApplicationConstants";
import { httpClient } from "./http-client";
import { encryptOutData } from "./codec";

import { ArticleT, Contact, Journal, QnA } from "@zjournal/ui-library";

// const host = window.location.host.split(":")[0];
// const port = "8080";
// const server = 'http://' + host + ':' + port;

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
    return putRequest(url, journal);
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

export const getArticleByCategoryAPI = (category: string, web: boolean) => {
    const categoryParam= category!==""?`?categryId=${category}`:``
    const publishedParam = web ? `&published=true` : ``;
    const url =`${getArticleAPIPath}${categoryParam}${publishedParam}`;
    return getRequest(url);
}

export const getArticleByAuthorAPI = (author: string, web: boolean) => {
    const authorParam = author !== "" ? `?author=${encodeURIComponent(author)}` : ``;
    const publishedParam = web ? `&published=true` : ``;
    const url = `${getArticleAPIPath}${authorParam}${publishedParam}`;
    return getRequest(url);
}

export const getArticleByMonthAPI = (blogDate: string, web: boolean) => {
    const url = `${getArticleAPIPath}?createdAt_like=${blogDate}${web ? `&published=true` : ``}`;
    return getRequest(url);
}

export const getArticlesToDeleteAPI = () => {
    const url = `${getArticleAPIPath}?&deleteFlag=true`;
    return getRequest(url);
}

export const addArticleAPI = (article: ArticleT) => {
    const url = `${getArticleAPIPath}`;
          console.log("ArticleContainer: onSave called with article:", article);

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
