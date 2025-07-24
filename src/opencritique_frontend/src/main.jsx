import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import { ArtProvider } from "./components/context/ArtContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ArtProvider>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </ArtProvider>
);
