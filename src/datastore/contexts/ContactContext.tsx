import * as React from "react";
import { defaultContact } from "../../ApplicationConstants";
import { Contact } from "../../Types";

type Action =
  | { type: "get_contacts_success"; value: Contact }
  | { type: "get_contacts_loading" }
  | { type: "get_contacts_error" }

  | { type: "add_contact_loading" }
  | { type: "add_contact_success",  value: Contact  }
  | { type: "add_contact_error" }

type Dispatch = (action: Action) => void;

type State = { contacts: Contact[]; status: string };

const ContactStateContext = React.createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

function contactReducer(state: State, action: Action) {
  switch (action.type) {
    case "get_contacts_loading": {
      return { status: "loading", contacts: state.contacts };
    }
  
    case "get_contacts_success": {
      return { contacts: [action.value], status: "success" };
    }
  
    case "get_contacts_error": {
      return { status: "error", contacts: state.contacts };
    }


    // add contact
    case "add_contact_loading": {
      return { status: "add_contact_loading", contacts: state.contacts };
    }

    case "add_contact_success": {
      return { status: "add_contact_success", contacts: [action.value] };
    }

    case "add_contact_error": {
      return { status: "add_contact_error", contacts: state.contacts };
    }

    default: {
      throw new Error(`Unhandled action type: ${action}`);
    }
  }
}

type ContactProviderProps = { children: React.ReactNode };

function ContactProvider({ children }: ContactProviderProps) {
  const [state, dispatch] = React.useReducer(contactReducer, {
    contacts: [defaultContact],
    status: "",
  });

  const value = { state, dispatch };
  return (
    <ContactStateContext.Provider value={value}>
      {children}
    </ContactStateContext.Provider>
  );
}

function useContact() {
  const context = React.useContext(ContactStateContext);
  if (context === undefined) {
    throw new Error("useContact must be used within a ContactProvider");
  }
  return context;
}

export { ContactProvider, useContact };
