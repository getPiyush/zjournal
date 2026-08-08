import React from "react";
import { MemoryRouter } from "react-router-dom";

export const parameters = {};
export const tags = ["autodocs"];

// Several components (e.g. PageNotFound) render react-router-dom's <Link>,
// which throws outside of a Router. Wrapping every story keeps that concern
// out of individual story files.
export const decorators = [
  (Story) =>
    React.createElement(MemoryRouter, null, React.createElement(Story)),
];
