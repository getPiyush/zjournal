import { ArticleT, Journal } from "./Types";

export const applicationProperties = {
  title:"Pharmaceutical Updates by Chandrasekhar Panda",
  author:"Chandrasekhar Panda",
  startDate: "2022-02-01",
  appPassword:"JagaBaliaShreekhetra"
}


  export const defaultArticle:ArticleT = {
    id: '',
    author: applicationProperties.author,
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
    components:[],
    templateArticles:[]
  };

  
  export const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  