export { default as Button } from "./components/Button/Button";

export { Logo } from './components/Logo';
export { Spinner } from './components/Spinner';
export { ArticleScroller } from './components/ArticleScroller';
export { default as Article } from './components/Article/Article';
export { default as ArticleContainer } from './components/Article/ArticleContainer';
export { default as Articles } from './components/Article/Articles';
export { default as ArticlePreviewWeb } from './components/Article/ArticlePreviewWeb';
export { Table } from './components/Table';
export { List } from './components/List';
export { TemplateRenderer, parseTemplateArticleIds } from './components/Templates/TemplateRenderer';
export { default as ArticleCard } from './components/Home/ArticleCard';
export { default as HeroArticle } from './components/Home/HeroArticle';
export { default as LoadingPage } from './components/Loader/LoadingPage';
export { default as SidePanel } from './components/Panel/SidePanel';
export { default as Blogs } from './components/Panel/Blogs';
export { default as Categories } from './components/Panel/Categories';

// Admin/editor components
export { default as ConfirmationButton } from './components/editor/ConfirmationButton';
export { default as EditPrompt } from './components/editor/EditPrompt';
export { default as EditWrapper } from './components/editor/EditWrapper';
export { default as SidePanelContainer } from './components/editor/SidePanelContainer';
export { TableEditor } from './components/editor/TableEditor';
export { default as ArticleContainerEditor } from './components/editor/ArticleContainerEditor';
export { default as SaveButton } from './components/editor/SaveButton';
export { default as ArticlePreview } from './components/editor/ArticlePreview';
export { default as ArticleEditor } from './components/editor/ArticleEditor';
export { ListEditor } from './components/editor/ListEditor';
export { PageTitle } from './components/PageTitle';
export { PageNotFound } from './components/PageNotFound';

// Shared types — the prop-type contract this library's components are built against.
export type { ComponentObject, ArticleT, Journal, Contact, QnA } from './Types';

// Pure utils — no data-fetching, no app state. Everything here is safe for any
// consumer to call with data it owns.
export { parsex } from './utils/parserUtil';
export {
  getUid,
  updateWithId,
  getComponentFromId,
  getArticleFromId,
  setComponentById,
  deleteComponent,
  populateComponentFromCode,
  populateContentFromJsonArray,
  getDate,
  getMonths,
  months,
  sliceWords,
  removeHTML,
} from './utils/componentUtil';
