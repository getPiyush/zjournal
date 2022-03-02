import "./styles.css";
import AppRoot from "./AppRoot";
import { JournalProvider } from "./datastore/contexts/JournalContext";

export default function App() {
  return (
    <JournalProvider>
      <AppRoot />
    </JournalProvider>
  );
}
