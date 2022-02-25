import "./styles.css";
import AppRoot from "./AppRoot";
import { JournalProvider } from "./contexts/JournalContext";

export default function App() {
  return (
    <JournalProvider>
      <AppRoot />
    </JournalProvider>
  );
}
