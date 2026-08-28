import { properties } from "./properties";
import { ArticleT, Contact, Journal, QnA } from "@zjournal/ui-library";

export const applicationProperties = properties;

export const defaultArticle: ArticleT = {
  id: "",
  author: applicationProperties.author,
  title: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  categryId: "",
  content: [],
  origin: "local",
  published: false,
  deleteFlag: false
};

export const defaultContact: Contact = {
  name: "",
  createdAt: new Date(),
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
  createdAt: new Date(),
};
