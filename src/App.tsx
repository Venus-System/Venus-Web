import { Route, Routes } from "react-router-dom";
import Componentes from "./pages/Componentes";
import CriarConta from "./pages/CriarConta";
import EsqueciSenha from "./pages/EsqueciSenha";
import Fontes from "./pages/Fontes";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Metodologia from "./pages/Metodologia";
import NovaSenha from "./pages/NovaSenha";
import SenhaAlterada from "./pages/SenhaAlterada";
import Pesquisa from "./pages/Pesquisa";
import Produto from "./pages/Produto";
import Sobre from "./pages/Sobre";
import NaoEncontrado from "./pages/NaoEncontrado";
import Dashboard from "./pages/Dashboard";
import RotaPrivada from "./components/RotaPrivada";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/componentes" element={<Componentes />} />
      <Route path="/login" element={<Login />} />
      <Route path="/criar-conta" element={<CriarConta />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/esqueci-senha/nova" element={<NovaSenha />} />
      <Route path="/esqueci-senha/pronto" element={<SenhaAlterada />} />
      <Route path="/pesquisa" element={<Pesquisa />} />
      <Route path="/produto/:slug" element={<Produto />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/metodologia" element={<Metodologia />} />
      <Route path="/fontes" element={<Fontes />} />
      <Route
        path="/dashboard"
        element={
          <RotaPrivada>
            <Dashboard />
          </RotaPrivada>
        }
      />
      <Route path="*" element={<NaoEncontrado />} />
    </Routes>
  );
}

export default App;
