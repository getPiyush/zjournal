import { ArticleT, Journal } from "./Types";


  export const defaultArticle:ArticleT = {
    id: '',
    author: "Piyush Praharaj",
    title: "",
    dateCreated: new Date(),
    dateModified: new Date(),
    categryId: "Production",
    content: [],
    origin:"local",
    published:false
  };
  
  export const defaultJournal :Journal = {
    title: "zJournal Default Title",
    selectedPage: "home",
    currentArticle: defaultArticle,
    categories: [],
    components:[]
  };
  