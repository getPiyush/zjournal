import axios from "axios";

import { ArticleT, Journal } from "../Types";
import { getPassPhase } from "../utils/crypto";

const host = window.location.host.split(":")[0];
const port = "8080";
const server = 'http://' + host + ':' + port;

const getJournalAPIPath = `${server}/journal`;
const getArticleAPIPath = `${server}/articles`;



// encryption
// const encryotedToken = getPassPhase(applicationProperties.appPassword)

const getParams = () => {
    return {
        headers: {
            "Zjournal-Secure-Token": getPassPhase()
        }
    };
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