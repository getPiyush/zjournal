type UiLibraryModule = typeof import("zjournalUiLibrary/index");

let modulePromise: Promise<UiLibraryModule> | null = null;

// Fetched once per page load: webpack's Module Federation runtime caches the
// remote container after the first import, so later calls resolve instantly
// without re-requesting remoteEntry.js.
export function loadUiLibrary(): Promise<UiLibraryModule> {
  if (!modulePromise) {
    modulePromise = import(
      /* webpackChunkName: "ui-library-remote" */ "zjournalUiLibrary/index"
    ) as Promise<UiLibraryModule>;
  }
  return modulePromise;
}
