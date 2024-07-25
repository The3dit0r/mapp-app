import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "./Meta.css";

import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { PopUpProvider } from "./context/PopUpContext";
import { UserDataProvider } from "./context/UserDataContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <PopUpProvider>
      <UserDataProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </UserDataProvider>
    </PopUpProvider>
  </BrowserRouter>
);
