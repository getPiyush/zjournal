import * as React from "react";
import { ArticleT } from "../../Types";

type Action =
  | { type: "update_article"; value: ArticleT }
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

type State = { article: ArticleT };

type ArticleProviderProps = { children: React.ReactNode };

const ArticleStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function articleReducer(state: State, action: Action) {
  console.log(action);
  switch (action.type) {
    case "update_article": {
      return { article: action.value };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

function ArticleProvider({ children }: ArticleProviderProps) {
  const [state, dispatch] = React.useReducer(articleReducer, {
    article: defaultArticle,
  });
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
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
