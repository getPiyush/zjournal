import "@testing-library/jest-dom";

// jsdom doesn't implement the legacy numeric-indexed access on HTMLFormElement
// (`form[0]`) that every real browser supports — only `form.elements[0]`.
// Several forms in this app read submitted fields via `e.target[0]` etc., so
// polyfill it here rather than change working, browser-correct source code.
for (let i = 0; i < 30; i++) {
  Object.defineProperty(HTMLFormElement.prototype, i, {
    configurable: true,
    get(this: HTMLFormElement) {
      return this.elements[i];
    },
  });
}
