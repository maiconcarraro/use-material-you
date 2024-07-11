import React from "react";
import ReactDOM from "react-dom/client";
import { Playground } from "./playground";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>,
);
