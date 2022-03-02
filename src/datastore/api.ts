import axios from "axios";

const server = 'http://localhost:3004';

const getJournalAPIPath = `${server}/journal`;
const getArticleAPIPath = `${server}/articles`;

export const getJournalAPI = () =>{
    return axios.get(getJournalAPIPath);
}

export const getArticleAPI = (id:string) =>{
    const url = `${getArticleAPIPath}?id=${id}`;
    return axios.get(url);
}

export const getArticleByCategoryAPI = (category:string) =>{
    const url = `${getArticleAPIPath}?categryId=${category}`;
    return axios.get(url);
}