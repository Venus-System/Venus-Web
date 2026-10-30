import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ProvedorAutenticacao } from "./contexts/autenticacao";
import { ProvedorAutenticacaoAdmin } from "./contexts/autenticacaoAdmin";
import { ProvedorChat } from "./contexts/chat";
import { aplicarAltoContraste, lerAltoContraste } from "./utils/altoContraste";
import "./styles/tokens.css";
import "./styles/global.css";

aplicarAltoContraste(lerAltoContraste());

const raiz = document.getElementById("root");

if (!raiz) {
  throw new Error("Elemento #root não encontrado no index.html.");
}

ReactDOM.createRoot(raiz).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true }}>
      <ProvedorAutenticacao>
        <ProvedorAutenticacaoAdmin>
          <ProvedorChat>
            <App />
          </ProvedorChat>
        </ProvedorAutenticacaoAdmin>
      </ProvedorAutenticacao>
    </BrowserRouter>
  </React.StrictMode>,

);
