import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
export default {
  stories: ["../src/**/*.stories.@(ts|tsx|js|jsx)"],
  addons: [getAbsolutePath("@chromatic-com/storybook"), getAbsolutePath("@storybook/addon-docs")],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {}
  }
};

// Using Vite framework provides native TSX support; no custom webpack loader needed.

function getAbsolutePath(value) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
