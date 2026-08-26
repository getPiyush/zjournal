import { lazy } from "react";
import type * as UiLibrary from "zjournalUiLibrary/index";
import { loadUiLibrary } from "./uiLibraryModule";

// Every UI component patrikaz renders comes from the ui-library MFE remote.
// Each is its own React.lazy boundary so it only downloads when the page
// that needs it actually renders; loadUiLibrary() dedupes the underlying
// remoteEntry.js fetch across all of them.
export const Logo = lazy<typeof UiLibrary.Logo>(async () => ({
  default: (await loadUiLibrary()).Logo,
}));

export const SidePanel = lazy<typeof UiLibrary.SidePanel>(async () => ({
  default: (await loadUiLibrary()).SidePanel,
}));

export const LoadingPage = lazy<typeof UiLibrary.LoadingPage>(async () => ({
  default: (await loadUiLibrary()).LoadingPage,
}));

export const Article = lazy<typeof UiLibrary.Article>(async () => ({
  default: (await loadUiLibrary()).Article,
}));

export const Articles = lazy<typeof UiLibrary.Articles>(async () => ({
  default: (await loadUiLibrary()).Articles,
}));

export const TemplateRenderer = lazy<typeof UiLibrary.TemplateRenderer>(async () => ({
  default: (await loadUiLibrary()).TemplateRenderer,
}));
