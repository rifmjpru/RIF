import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { SiteDataProvider } from "./components/SiteDataProvider.jsx";
import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteDataProvider>
        <App />
      </SiteDataProvider>
    </BrowserRouter>
  </React.StrictMode>
);

