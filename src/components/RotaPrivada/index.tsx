import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAutenticacao } from "../../hooks/useAutenticacao";

interface RotaPrivadaProps {
  children: ReactNode;
}

function RotaPrivada({ children }: RotaPrivadaProps) {
  const { usuario, carregando } = useAutenticacao();
  const localizacao = useLocation();

  if (carregando) {
    return <p aria-live="polite">Verificando sua sessão...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ de: localizacao.pathname }} replace />
  }

  return <>{children}</>
}

export default RotaPrivada;