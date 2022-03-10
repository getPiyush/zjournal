import * as React from "react";
import { defaultArticle } from "../../ApplicationConstants";
import { ArticleT } from "../../Types";

type Action =
  | { type: "get_article_by_id"; value: ArticleT }
  | { type: "get_article_by_id_loading" }
  | { type: "get_article_by_id_error" }
  | { type: "get_article_by_ids_success"; value: ArticleT[] }
  | { type: "get_article_by_ids_loading" }
  | { type: "get_article_by_ids_error" }
  | { type: "get_article_by_category"; value: ArticleT[] }
  | { type: "get_article_by_category_loading" }
  | { type: "get_article_by_category_error" }
  | { type: "get_article_by_blog_date"; value: ArticleT[] }
  | { type: "get_article_by_blog_date_loading" }
  | { type: "get_article_by_blog_date_error" }
  | { type: "add_article_loading" }
  | { type: "add_article_success" }
  | { type: "add_article_error" }
  | { type: "update_article_loading" }
  | { type: "update_article_success" }
  | { type: "update_article_error" }
  | { type: "add_article"; value: ArticleT };

type Dispatch = (action: Action) => void;

type State = { articles: ArticleT[]; status: string };

const ArticleStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function articleReducer(state: State, action: Action) {
  switch (action.type) {
    case "get_article_by_id_loading": {
      return { status: "loading", articles: state.articles };
    }
  
    case "get_article_by_id": {
      return { articles: [action.value], status: "success" };
    }
  
    case "get_article_by_id_error": {
      return { status: "error", articles: state.articles };
    }
  
    case "get_article_by_ids_loading": {
      return { status: "loading", articles: state.articles };
    }

    case "get_article_by_ids_success": {
      return { articles: action.value, status: "success" };
    }

    case "get_article_by_ids_error": {
      return { status: "error", articles: state.articles };
    }


    case "get_article_by_category_loading": {
      return { status: "loading", articles: state.articles };
    }

    case "get_article_by_category": {
      return { articles: action.value, status: "success" };
    }

    case "get_article_by_category_error": {
      return { status: "error", articles: state.articles };
    }

    case "get_article_by_blog_date_loading": {
      return { status: "loading", articles: state.articles };
    }
  
    case "get_article_by_blog_date": {
      return { articles: action.value, status: "success" };
    }
  
    case "get_article_by_blog_date_error": {
      return { status: "error", articles: state.articles };
    }

    // add article
    case "add_article_loading": {
      return { status: "loading", articles: state.articles };
    }

    case "add_article_success": {
      return { status: "success", articles: state.articles };
    }

    case "add_article_error": {
      return { status: "error", articles: state.articles };
    }

    // update article
    case "update_article_loading": {
      return { status: "loading", articles: state.articles };
    }

    case "update_article_success": {
      return { status: "success", articles: state.articles };
    }

    case "update_article_error": {
      return { status: "error", articles: state.articles };
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
    status: "",
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
