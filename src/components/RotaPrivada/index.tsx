import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAutenticacao } from "../../hooks/useAutenticacao";
import MainLayout from "../MainLayout";

interface RotaPrivadaProps {
  children: ReactNode;
}

function RotaPrivada({ children }: RotaPrivadaProps) {
  const { usuario, carregando } = useAutenticacao();
  const localizacao = useLocation();

  if (carregando) {
    return (
      <MainLayout>
        <p aria-live="polite">Verificando sua sessão...</p>
      </MainLayout>
    );
  }

  if (!usuario) {
    return (
      <Navigate to="/login" state={{ de: localizacao.pathname }} replace />
    );
  }

  return <>{children}</>;
}

export default RotaPrivada;