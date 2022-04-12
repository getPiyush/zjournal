import * as React from "react";
import { defaultQnA } from "../../ApplicationConstants";
import { QnA } from "../../Types";

type Action =
  | { type: "get_qnas_success"; value: QnA[] }
  | { type: "get_qnas_loading" }
  | { type: "get_qnas_error" }
  | { type: "add_qna_loading" }
  | { type: "add_qna_success"; value: QnA}
  | { type: "add_qna_error" }
  | { type: "delete_qna_loading" }
  | { type: "delete_qna_success"; value: QnA}
  | { type: "delete_qna_error" };

type Dispatch = (action: Action) => void;

type State = { qnas: QnA[]; status: string };

const QnAStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function qnaReducer(state: State, action: Action) {
  switch (action.type) {
    case "get_qnas_loading": {
      return { status: "get_qnas_loading", qnas: state.qnas };
    }

    case "get_qnas_success": {
      return { qnas: action.value, status: "get_qnas_success" };
    }

    case "get_qnas_error": {
      return { status: "get_qnas_error", qnas: state.qnas };
    }

    // add qna
    case "add_qna_loading": {
      return { status: "add_qna_loading", qnas: state.qnas };
    }

    case "add_qna_success": {
      return { status: "add_qna_success", qnas: [action.value, ...state.qnas] };
    }

    case "add_qna_error": {
      return { status: "add_qna_error", qnas: state.qnas };
    }

     // delete qna
     case "delete_qna_loading": {
      return { status: "delete_qna_loading", qnas: state.qnas };
    }

    case "delete_qna_success": {
      return { status: "delete_qna_success", qnas: state.qnas };
    }

    case "delete_qna_error": {
      return { status: "delete_qna_error", qnas: state.qnas };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

type QnAProviderProps = { children: React.ReactNode };

function QnAProvider({ children }: QnAProviderProps) {
  const [state, dispatch] = React.useReducer(qnaReducer, {
    qnas: [defaultQnA],
    status: "",
  });

  const value = { state, dispatch };
  return (
    <QnAStateContext.Provider value={value}>
      {children}
    </QnAStateContext.Provider>
  );
}

function useQnA() {
  const context = React.useContext(QnAStateContext);
  if (context === undefined) {
    throw new Error("useQnA must be used within a QnAProvider");
  }
  return context;
}

export { QnAProvider, useQnA };
