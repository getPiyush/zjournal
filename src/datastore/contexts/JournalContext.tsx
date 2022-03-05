import * as React from "react";
import { ArticleT, Journal } from "../../Types";
import { getUid } from "../../utils/componentUtil";

type Action =
  | { type: "update_journal"; value: Journal }
  | { type: "update_journal_loading" }
  | { type: "update_journal_error" }
  | { type: "update_page"; value: string }
  | { type: "reset_page" }
  | { type: "update_current_article"; value: ArticleT };
type Dispatch = (action: Action) => void;

const defaultArticle = {
  id: getUid(),
  author: "Piyush Praharaj",
  title: "",
  dateCreated: new Date(),
  dateModified: new Date(),
  categryId: "NONE",
  content: [],
};

const defaultJournal = {
  title: "zJournal Default Title",
  selectedPage: "home",
  currentArticle: defaultArticle,
  categories: [],
  components:[]
};

type State = { journal: Journal; status: string };

type JournalProviderProps = { children: React.ReactNode };

const JournalStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function journalReducer(state: State, action: Action) {
  switch (action.type) {
    case "update_journal_loading": {
      return { status: "loading", journal: state.journal };
    }

    case "update_journal_error": {
      return { status: "error", journal: state.journal };
    }

    case "update_journal": {
      return { journal: action.value, status: "success" };
    }

    case "update_page": {
      return {
        journal: { ...state.journal, selectedPage: action.value },
        status: "",
      };
    }

    case "reset_page": {
      return {
        journal: { ...state.journal, selectedPage: "home" },
        status: "",
      };
    }

    case "update_current_article": {
      return {
        journal: { ...state.journal, currentArticle: action.value },
        status: "",
      };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

function JournalProvider({ children }: JournalProviderProps) {
  const [state, dispatch] = React.useReducer(journalReducer, {
    journal: defaultJournal,
    status: "",
  });

  const value = { state, dispatch };
  return (
    <JournalStateContext.Provider value={value}>
      {children}
    </JournalStateContext.Provider>
  );
}

function useJournal() {
  const context = React.useContext(JournalStateContext);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
}

export { JournalProvider, useJournal };
