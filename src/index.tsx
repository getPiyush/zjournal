import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
console.log("NODE_ENV =",process.env.NODE_ENV);
const rootElement = document.getElementById("root");
render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  rootElement
);
