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
    const url = `${getArticleAPIPath}/${id}`;
    return axios.get(url);
}

export const getArticleByIdsAPI = (ids: string[]) => {
    const idUrl = ids.join('&id=');
    const url = `${getArticleAPIPath}?id=${idUrl}`;
    return axios.get(url);
}

export const getArticleByCategoryAPI = (category: string, web:boolean) => {
    const url = `${getArticleAPIPath}?categryId=${category}${web?`&published=true`:``}`;
    return axios.get(url);
}

export const getArticleByMonthAPI = (blogDate: string, web:boolean) => {
    const url = `${getArticleAPIPath}?dateCreated_like=${blogDate}${web?`&published=true`:``}`;
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
