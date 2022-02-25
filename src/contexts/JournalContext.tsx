import * as React from "react";

type Action = {type:'update_journal'; value:Journal} | { type: "update_page"; value: string } | { type: "reset_page" };
type Dispatch = (action: Action) => void;

type Journal = {
  title: string;
  selectedPage: string;
  currentArticle: string;
  categories: string[];
};
const defaultJournal = {
  title: "zJournal Default Title",
  selectedPage: "home",
  currentArticle: "12i3u1yb113182b8s7b",
  categories: [],
};

type State = { journal: Journal };

type JournalProviderProps = { children: React.ReactNode };

const JournalStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function journalReducer(state: State, action: Action) {
  console.log(action);
  switch (action.type) {

    
    case "update_journal": {
      return { journal: action.value };
    }

    case "update_page": {
      return { journal: {...state.journal,selectedPage:action.value} };
    }

    case "reset_page": {
      return { journal: {...state.journal,selectedPage:"home" }};
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

function JournalProvider({ children }: JournalProviderProps) {
  const [state, dispatch] = React.useReducer(journalReducer, {journal: defaultJournal});
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
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
