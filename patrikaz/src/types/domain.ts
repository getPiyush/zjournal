// Local copy of the shared domain shapes patrikaz exchanges with the
// zjournalUiLibrary remote and the zJournal API. patrikaz is an independently
// deployed/repo'd app, so it does not import these from @zjournal/ui-library —
// it owns this contract itself and keeps it in sync by hand against whatever
// remoteEntry.js currently serves.

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
  createdAt: Date;
  updatedAt: Date;
  categryId: string;
  content: ComponentObject[];
  origin: "server" | "local";
  published: boolean;
  deleteFlag: boolean;
};

export type Journal = {
  title: string;
  selectedPage: string;
  loggedIn?: boolean;
  currentArticle: ArticleT;
  categories: string[];
  components: string[];
  templateArticles: string[];
  templateData: string;
  adminDetails?: { id: string; passPhase: string };
  aboutUs?: string;
};
