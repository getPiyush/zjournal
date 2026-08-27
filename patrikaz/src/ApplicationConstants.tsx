import { properties } from "./properties";
import type { ArticleT, Journal } from "./types/domain";

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
  deleteFlag: false,
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
