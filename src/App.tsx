import { Route, Routes } from "react-router-dom";
import Componentes from "./pages/Componentes";
import CriarConta from "./pages/CriarConta";
import EsqueciSenha from "./pages/EsqueciSenha";
import Fontes from "./pages/Fontes";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import FilaAprovacao from "./pages/FilaAprovacao";
import RotaAdmin from "./components/RotaAdmin";
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
import Perfil from "./pages/Perfil";
import Perguntas from "./pages/Perguntas";
import Privacidade from "./pages/Privacidade";
import Termos from "./pages/Termos";
import Cookies from "./pages/Cookies";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      {import.meta.env.DEV ? (
        <Route path="/componentes" element={<Componentes />} />
      ) : null}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/fila/:id?"
        element={
          <RotaAdmin>
            <FilaAprovacao />
          </RotaAdmin>
        }
      />
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
      <Route
        path="/perfil"
        element={
          <RotaPrivada>
            <Perfil />
          </RotaPrivada>
        }
      />
      <Route
        path="/perguntas"
        element={
          <RotaPrivada>
            <Perguntas />
          </RotaPrivada>
        }
      />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="*" element={<NaoEncontrado />} />
    </Routes>
  );
}

export default App;
