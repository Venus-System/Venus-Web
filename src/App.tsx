import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import RotaAdmin from "./components/RotaAdmin";
import RotaPrivada from "./components/RotaPrivada";
import { CAMINHO_DE_VOLTA } from "./utils/conexaoGoogle";

const Componentes = lazy(() => import("./pages/Componentes"));
const CriarConta = lazy(() => import("./pages/CriarConta"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const Fontes = lazy(() => import("./pages/Fontes"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const FilaAprovacao = lazy(() => import("./pages/FilaAprovacao"));
const Inicio = lazy(() => import("./pages/Inicio"));
const Metodologia = lazy(() => import("./pages/Metodologia"));
const NovaSenha = lazy(() => import("./pages/NovaSenha"));
const SenhaAlterada = lazy(() => import("./pages/SenhaAlterada"));
const Pesquisa = lazy(() => import("./pages/Pesquisa"));
const Produto = lazy(() => import("./pages/Produto"));
const Sobre = lazy(() => import("./pages/Sobre"));
const NaoEncontrado = lazy(() => import("./pages/NaoEncontrado"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Perguntas = lazy(() => import("./pages/Perguntas"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const Termos = lazy(() => import("./pages/Termos"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Enviados = lazy(() => import("./pages/Enviados"));
const Historico = lazy(() => import("./pages/Historico"));
const Favoritos = lazy(() => import("./pages/Favoritos"));
const Comparar = lazy(() => import("./pages/Comparar"));
const Escanear = lazy(() => import("./pages/Escanear"));
const Reacao = lazy(() => import("./pages/Reacao"));
const IntegracaoGoogleAgenda = lazy(
  () => import("./pages/IntegracaoGoogleAgenda"),
);

function App() {
  return (
    <Suspense fallback={null}>
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
        <Route path="/comparar" element={<Comparar />} />
        <Route
          path="/escanear"
          element={
            <RotaPrivada>
              <Escanear />
            </RotaPrivada>
          }
        />
        <Route path="/reacao" element={<Reacao />} />
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
          path="/historico"
          element={
            <RotaPrivada>
              <Historico />
            </RotaPrivada>
          }
        />
        <Route
          path="/favoritos"
          element={
            <RotaPrivada>
              <Favoritos />
            </RotaPrivada>
          }
        />
        <Route
          path="/historico/enviados"
          element={
            <RotaPrivada>
              <Enviados />
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
        <Route
          path={CAMINHO_DE_VOLTA}
          element={
            <RotaPrivada>
              <IntegracaoGoogleAgenda />
            </RotaPrivada>
          }
        />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
    </Suspense>
  );
}

export default App;
