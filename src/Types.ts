// This page will hold all the types

export type ComponentObject = {
  componenType: string;
  data: string | string[];
  altText?: string;
};

export type ArticleT = {
  id: string;
  author: string;
  title: string;
  dateCreated: Date;
  dateModified: Date;
  categryId: string;
  content: ComponentObject[];

} 
