import "./styles.css";
import AppRoot from "./AppRoot";
import { JournalProvider } from "./datastore/contexts/JournalContext";
import { ArticleProvider } from "./datastore/contexts/ArticleContext";

export default function App() {
  return (
    <JournalProvider>
      <ArticleProvider>
      <AppRoot />
      </ArticleProvider>
    </JournalProvider>
  );
}
