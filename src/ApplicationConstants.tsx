import { properties } from "./properties";
import { ArticleT, Contact, Journal, QnA } from "./Types";

export const applicationProperties = properties;

export const defaultArticle: ArticleT = {
  id: "",
  author: applicationProperties.author,
  title: "",
  dateCreated: new Date(),
  dateModified: new Date(),
  categryId: "Production",
  content: [],
  origin: "local",
  published: false,
  deleteFlag: false
};

export const defaultContact: Contact = {
  name: "",
  dateContacted: new Date(),
  email: "",
  phone: "",
  comment: "",
};

export const defaultJournal: Journal = {
  title: "zJournal Default Title",
  selectedPage: "home",
  currentArticle: defaultArticle,
  loggedIn: false,
  categories: [],
  components: [],
  templateArticles: [],
  templateData: "",
};

export const defaultQnA: QnA = {
  question: "",
  answer: "",
  id: "",
  published: false,
  dateCreated: new Date(),
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
