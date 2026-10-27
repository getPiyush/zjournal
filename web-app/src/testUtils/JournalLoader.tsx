import { useEffect } from "react";
import { Journal } from "@zjournal/ui-library";
import { useJournal } from "../datastore/contexts/JournalContext";
import { defaultJournal } from "../ApplicationConstants";

// Simulates the journal arriving from the server after a page has already rendered.
export function JournalLoader({ journal }: { journal: Partial<Journal> | null }) {
  const { dispatch } = useJournal();
  useEffect(() => {
    if (journal) dispatch({ type: "get_journal_success", value: { ...defaultJournal, ...journal } });
  }, [journal]);
  return null;
}
