import axios from "axios";
import HmacSHA1 from 'crypto-js/hmac-sha512';
import { applicationProperties } from "../ApplicationConstants";

import { ArticleT } from "../Types";

const host = window.location.host.split(":")[0];
const port = "3004";
const server = 'http://' + host + ':' + port;

const getJournalAPIPath = `${server}/journal`;
const getArticleAPIPath = `${server}/articles`;

// encryption
const date = new Date();
const message = date.getUTCFullYear()+"$"+date.getUTCDate()+"$"+date.getUTCMonth()+"$"+date.getUTCDay();
const encryotedToken = HmacSHA1(message, applicationProperties.appPassword)

const header = {
    headers: {
        "Zjournal-Secure-Token": encryotedToken
    }
}

const getRequest = (url) => {
    return axios.get(url, header);
}

const putRequest = (url, obj) => {
    return axios.put(url, obj);
}

const postRequest = (url, obj) => {
    return axios.post(url, obj);
}


export const getJournalAPI = () => {
    return getRequest(getJournalAPIPath);
}

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
