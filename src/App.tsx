import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import { Route, Routes } from "react-router-dom";
import PageLoading from "./components/PageLoading";
import RotaAdmin from "./components/RotaAdmin";
import RotaPrivada from "./components/RotaPrivada";
import RouteAnnouncer from "./components/RouteAnnouncer";
import ErroAoCarregar from "./pages/ErroAoCarregar";
import { CAMINHO_DE_VOLTA } from "./utils/conexaoGoogle";

function carregarPagina(importar: () => Promise<{ default: ComponentType }>) {
  return lazy(() => importar().catch(() => ({ default: ErroAoCarregar })));
}

const Componentes = carregarPagina(() => import("./pages/Componentes"));
const CriarConta = carregarPagina(() => import("./pages/CriarConta"));
const EsqueciSenha = carregarPagina(() => import("./pages/EsqueciSenha"));
const Fontes = carregarPagina(() => import("./pages/Fontes"));
const Login = carregarPagina(() => import("./pages/Login"));
const AdminLogin = carregarPagina(() => import("./pages/AdminLogin"));
const FilaAprovacao = carregarPagina(() => import("./pages/FilaAprovacao"));
const Inicio = carregarPagina(() => import("./pages/Inicio"));
const Metodologia = carregarPagina(() => import("./pages/Metodologia"));
const NovaSenha = carregarPagina(() => import("./pages/NovaSenha"));
const SenhaAlterada = carregarPagina(() => import("./pages/SenhaAlterada"));
const Pesquisa = carregarPagina(() => import("./pages/Pesquisa"));
const Produto = carregarPagina(() => import("./pages/Produto"));
const Sobre = carregarPagina(() => import("./pages/Sobre"));
const NaoEncontrado = carregarPagina(() => import("./pages/NaoEncontrado"));
const Dashboard = carregarPagina(() => import("./pages/Dashboard"));
const Perfil = carregarPagina(() => import("./pages/Perfil"));
const Perguntas = carregarPagina(() => import("./pages/Perguntas"));
const Privacidade = carregarPagina(() => import("./pages/Privacidade"));
const Termos = carregarPagina(() => import("./pages/Termos"));
const Cookies = carregarPagina(() => import("./pages/Cookies"));
const Acessibilidade = carregarPagina(() => import("./pages/Acessibilidade"));
const Enviados = carregarPagina(() => import("./pages/Enviados"));
const Historico = carregarPagina(() => import("./pages/Historico"));
const Favoritos = carregarPagina(() => import("./pages/Favoritos"));
const Comparar = carregarPagina(() => import("./pages/Comparar"));
const Escanear = carregarPagina(() => import("./pages/Escanear"));
const Reacao = carregarPagina(() => import("./pages/Reacao"));
const IntegracaoGoogleAgenda = carregarPagina(
  () => import("./pages/IntegracaoGoogleAgenda"),
);

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RouteAnnouncer />
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
        <Route path="/acessibilidade" element={<Acessibilidade />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Routes>
    </Suspense>
  );
}

export default App;
