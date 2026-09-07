import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ProvedorAutenticacao } from "./contexts/autenticacao";
import "./styles/tokens.css";
import "./styles/global.css";

const raiz = document.getElementById("root");

if (!raiz) {
  throw new Error("Elemento #root não encontrado no index.html.");
}

ReactDOM.createRoot(raiz).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProvedorAutenticacao>
        <App />
      </ProvedorAutenticacao>
    </BrowserRouter>
  </React.StrictMode>,

);
