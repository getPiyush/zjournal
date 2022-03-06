import axios from "axios";
import { ArticleT } from "../Types";

const host = window.location.host.split(":")[0];
const port = "3004";
const server = 'http://' + host + ':' + port;

const getJournalAPIPath = `${server}/journal`;
const getArticleAPIPath = `${server}/articles`;

export const getJournalAPI = () => {
    return axios.get(getJournalAPIPath);
}

export const getArticleByIdAPI = (id: string) => {
    const url = `${getArticleAPIPath}?id=${id}`;
    return axios.get(url);
}

export const getArticleByCategoryAPI = (category: string) => {
    const url = `${getArticleAPIPath}?categryId=${category}`;
    return axios.get(url);
}

export const addArticleAPI = (article: ArticleT) => {
    const url = `${getArticleAPIPath}`;
    return axios.post(url, article);
}

export const updateArticleAPI = (article: ArticleT) => {
    const url = `${getArticleAPIPath}/${article.id}`;
    return axios.put(url, article);
}
