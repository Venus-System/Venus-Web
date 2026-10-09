import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAutenticacaoAdmin } from "../../hooks/useAutenticacaoAdmin";

interface RotaAdminProps {
  children: ReactNode;
}

function RotaAdmin({ children }: RotaAdminProps) {
  const { administrador } = useAutenticacaoAdmin();
  const localizacao = useLocation();

  if (administrador === null) {
    return (
      <Navigate
        to="/admin/login"
        state={{ de: localizacao.pathname + localizacao.search }}
        replace
      />
    );
  }

  return <>{children}</>;
}

export default RotaAdmin;
