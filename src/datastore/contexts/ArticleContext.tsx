import * as React from "react";
import { ArticleT } from "../../Types";

type Action =
  | { type: "get_article_by_category"; value: ArticleT[] }
  | {type:"get_article_by_category_loading"}
  | {type:"get_article_by_category_error"}
  | { type: "add_article"; value: ArticleT };

type Dispatch = (action: Action) => void;

const defaultArticle = {
  id: "kzzua95cipc28wgefia",
  author: "Piyush Praharaj",
  title: "What is Genetics?",
  dateCreated: new Date(),
  dateModified:new Date(),
  categryId: "Microbiology",
  content: []
};

type State = { articles: ArticleT[],  status: string };


const ArticleStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function articleReducer(state: State, action: Action) {
  switch (action.type) {


    case "get_article_by_category_loading": {
      return { status: "loading", articles:state.articles };
    }

    case "get_article_by_category": {
      return { articles: action.value, status: "success" };
    }

    case "get_article_by_category_error": {
      return {  status: "error", articles: state.articles };
    }
    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

type ArticleProviderProps = { children: React.ReactNode };

function ArticleProvider({ children }: ArticleProviderProps) {
  const [state, dispatch] = React.useReducer(articleReducer, {
    articles: [defaultArticle],
    status:""
  });

  const value = { state, dispatch };
  return (
    <ArticleStateContext.Provider value={value}>
      {children}
    </ArticleStateContext.Provider>
  );
}

function useArticle() {
  const context = React.useContext(ArticleStateContext);
  if (context === undefined) {
    throw new Error("useArticle must be used within a ArticleProvider");
  }
  return context;
}

export { ArticleProvider, useArticle };
