import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import { ArtProvider } from "./components/context/ArtContext";
import { UserProvider } from "./components/context/UserContext"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <UserProvider>
      <ArtProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ArtProvider>
    </UserProvider>
  // </React.StrictMode>
);
