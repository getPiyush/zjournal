// Type contract for the zjournalUiLibrary Module Federation remote
// (see ui-library/webpack.config.js in the zJournal monorepo — remote name
// "zjournalUiLibrary", exposed module "./index").
//
// patrikaz is an independently deployed/repo'd app: it does not depend on
// @zjournal/ui-library's source for types, so this contract is maintained by
// hand against whatever remoteEntry.js currently serves. If the remote's
// exported API changes, this file needs to be updated to match.
declare module "zjournalUiLibrary/index" {
  import type { ComponentType, ReactNode } from "react";
  import type { ArticleT, Journal } from "./domain";

  export type { ArticleT, Journal };

  export const Logo: ComponentType<{
    title?: string;
    subtext?: string;
    image?: string;
    onClick?: () => void;
  }>;

  export const SidePanel: ComponentType<{
    selectedPage?: string;
    categories: string[];
    startDate: string;
    basePath?: string;
  }>;

  export const LoadingPage: ComponentType<Record<string, never>>;

  export const Article: ComponentType<{
    article: ArticleT | null;
    status?: string;
    disableTextSelect?: boolean;
    onBrowseCategories?: () => void;
    basePath?: string;
  }>;

  export const Articles: ComponentType<{
    title: string;
    status: string;
    articles: ArticleT[];
    disableTextSelect?: boolean;
    onBrowseCategories?: () => void;
    basePath?: string;
  }>;

  export const TemplateRenderer: ComponentType<{
    dataString: string;
    invalidArticleError: (articleId: string, flag: boolean) => void;
    mode: "view" | "edit";
    articles: ArticleT[];
    status: string;
  }>;

  export function parsex(html: string | string[]): ReactNode;
  export function parseTemplateArticleIds(dataString: string): string[];
  export const months: string[];
}
