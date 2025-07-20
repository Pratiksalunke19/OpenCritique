import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import { ArtProvider } from "./context/ArtContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ArtProvider>
      <App />
    </ArtProvider>
  </BrowserRouter>
);
