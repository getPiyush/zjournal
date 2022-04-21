import axios from "axios";

import { ArticleT, Contact, Journal, QnA } from "../Types";
import { getPassPhase } from "../utils/crypto";

const host = window.location.host.split(":")[0];
const port = "8080";
//const server = 'http://' + host + ':' + port;
const server = 'http://feeder.patrikaz.com';

const getJournalAPIPath = `${server}/journal`;
const getArticleAPIPath = `${server}/articles`;
const getContactsAPIPath = `${server}/contacts`;
const getQnAsAPIPath =  `${server}/qna`;




// encryption
// const encryotedToken = getPassPhase(applicationProperties.appPassword)

const getParams = () => {
    return {};
   /* return {
        headers: {
            "Zjournal-Secure-Token": getPassPhase()
        }
    };
    */
}

const getRequest = (url) => {
    return axios.get(url, getParams());
}

const putRequest = (url, obj) => {
    return axios.put(url, obj, getParams());
}

const postRequest = (url, obj) => {
    return axios.post(url, obj, getParams());
}

const deleteRequest = (url) => {
    return axios.delete(url, getParams());
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
    const url = `${getArticleAPIPath}?categryId=${category}${web ? `&published=true` : ``}`;
    return getRequest(url);
}

export const getArticleByMonthAPI = (blogDate: string, web: boolean) => {
    const url = `${getArticleAPIPath}?dateCreated_like=${blogDate}${web ? `&published=true` : ``}`;
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

/**
 * 
Journal APIS
 */

export const getContactsAPI = () => {
    return getRequest(`${getContactsAPIPath}?_sort=dateContacted&_order=desc`);
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
    return getRequest(`${getQnAsAPIPath}?_sort=dateCreated&_order=desc`);
}


export const addQnAAPI = (qna: QnA) => {
    const url = `${getQnAsAPIPath}`;
    return postRequest(url, qna);
}

export const deleteQnAAPI = (id: string) => {
    const url = `${getQnAsAPIPath}/${id}`;
    return deleteRequest(url);
}
