// This page will hold all the types

export type ComponentObject = {
  componentId?: string;
  componenType: string;
  data: string | string[];
  altText?: string;
  numbered?: boolean;
};

export type ArticleT = {
  id: string;
  author: string;
  title: string;
  dateCreated: Date;
  dateModified: Date;
  categryId: string;
  content: ComponentObject[];
  origin: "server" | "local";
  published: boolean;
}

export type Journal = {
  title: string;
  selectedPage: string;
  loggedIn?: boolean;
  currentArticle: ArticleT;
  categories: string[];
  components: string[];
  templateArticles: string[];
  templateData:string,
  adminDetails?: { id: string, passPhase: string }
};

export type Contact = {
  name: string;
  email: string;
  phone?: string;
  dateContacted: Date;
  comment:string;
}